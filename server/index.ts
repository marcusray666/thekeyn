import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// Add environment variable debugging for Railway
console.log('🔍 Environment variables check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('Available DB variables:', Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('PG')
));

import { pool } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();

// Enable trust proxy for production deployments
app.set('trust proxy', 1);

// CORS Configuration for Railway deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        // Railway deployment patterns
        /https:\/\/.*\.railway\.app$/,
        /https:\/\/.*\.up\.railway\.app$/,
        // Add patterns for common hosting services
        /https:\/\/.*\.vercel\.app$/,
        /https:\/\/.*\.netlify\.app$/,
        /https:\/\/.*\.pages\.dev$/
      ].filter((origin): origin is string | RegExp => origin !== undefined)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only server
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many upload attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/works', uploadLimiter);

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: false, limit: '500mb' }));

// Session activity tracking middleware
app.use((req, res, next) => {
  if (req.session && (req.session as any).userId) {
    // Update session activity timestamp on each authenticated request
    (req.session as any).lastActivity = new Date();
    console.log(`Session activity updated for user ${(req.session as any).userId}`);
  }
  next();
});

// Session configuration with 1-hour timeout
const PgSession = ConnectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour timeout
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser set domain
  },
}));

(async () => {
  const server = await registerRoutes(app);

  async function ensureAdminUser() {
    try {
      const bcrypt = await import('bcryptjs');
      const adminUsername = 'vladislavdonighevici111307';
      const adminPass = 'admin';
      
      const result = await pool.query(
        'SELECT 1 FROM users WHERE username = $1',
        [adminUsername]
      );
      
      if (result.rowCount === 0) {
        const hash = await bcrypt.default.hash(adminPass, 12);
        await pool.query(
          `INSERT INTO users (username, password_hash, email, role, is_verified)
           VALUES ($1, $2, $3, $4, $5)`,
          [adminUsername, hash, 'admin@example.com', 'admin', true]
        );
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.error('❌ Failed to ensure admin user:', error instanceof Error ? error.message : String(error));
    }
  }

  // Set up Vite middleware for development
  if (process.env.NODE_ENV === 'development') {
    const { setupVite } = await import('./vite.js');
    await setupVite(app, server);
    console.log('🎨 Vite development server configured');
  } else {
    // In production, serve static files directly without importing vite.ts
    const path = await import('path');
    const fs = await import('fs');
    const express = await import('express');
    
    // Check multiple possible build locations (Railway production uses dist/public)
    const possiblePaths = [
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(process.cwd(), "client", "dist"), 
      path.resolve(process.cwd(), "dist"),
      path.resolve(process.cwd(), "build"),
      path.resolve(process.cwd(), "public")
    ];
    
    console.log('Current working directory:', process.cwd());
    console.log('Available files in root:', fs.readdirSync(process.cwd()));
    
    if (fs.existsSync('dist')) {
      console.log('Contents of dist directory:', fs.readdirSync('dist'));
    }
    if (fs.existsSync('client/dist')) {
      console.log('Contents of client/dist directory:', fs.readdirSync('client/dist'));
    }
    
    let foundPath = null;
    for (const possiblePath of possiblePaths) {
      console.log(`Checking: ${possiblePath}`);
      if (fs.existsSync(possiblePath)) {
        const files = fs.readdirSync(possiblePath);
        console.log(`Found directory with files: ${files.join(', ')}`);
        if (files.includes('index.html')) {
          foundPath = possiblePath;
          console.log(`✅ Using build directory: ${foundPath}`);
          break;
        }
      }
    }
    
    if (foundPath) {
      // Serve static files first
      app.use(express.static(foundPath));
      
      // Catch-all handler for SPA routing (must be last)
      app.get("*", (_req, res) => {
        const indexPath = path.resolve(foundPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('<h1>Frontend build not found</h1><p>index.html missing from build directory</p>');
        }
      });
      console.log('📁 Static files configured for production');
      console.log(`📂 Serving from: ${foundPath}`);
    } else {
      console.error(`❌ Could not find build directory with index.html. Checked: ${possiblePaths.join(', ')}`);
      // Serve a basic error page
      app.use("*", (_req, res) => {
        res.status(500).send(`
          <h1>Build Error</h1>
          <p>Could not find frontend build directory.</p>
          <p>Checked paths: ${possiblePaths.join(', ')}</p>
          <p>Available files: ${fs.existsSync('.') ? fs.readdirSync('.').join(', ') : 'none'}</p>
        `);
      });
    }
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Global error handler:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });

  const PORT = parseInt(process.env.PORT || '5000');
  
  // Railway automatically sets NODE_ENV=production in production environment
  // Force production mode for Railway deployment
  if (process.env.RAILWAY_ENVIRONMENT || !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('🚂 Railway deployment detected - forcing production mode');
  }
  
  // Idempotent database initialization for safe Railway deployments
  async function initializeDatabase() {
    try {
      console.log('🔧 Initializing database...');
      
      // SAFETY CHECK: Verify we're not accidentally wiping production data
      try {
        const dataCount = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
            (SELECT COUNT(*) FROM users) as user_count,
            (SELECT COUNT(*) FROM works) as work_count
        `);
        
        const { table_count, user_count, work_count } = dataCount.rows[0];
        console.log(`📊 Database status: ${table_count} tables, ${user_count} users, ${work_count} works`);
        
        // PRODUCTION DATA PROTECTION: If significant data exists, skip risky operations
        if (user_count > 30 || work_count > 10) {
          console.log('🛡️ Production data detected - using extra safety measures');
        }
      } catch (err) {
        console.log('📊 Database appears empty or inaccessible');
      }
      
      // Comprehensive schema verification - check critical tables exist
      const criticalTables = ['users', 'works', 'certificates', 'posts', 'user_background_preferences', 'background_interactions'];
      const missingTables = [];
      
      for (const table of criticalTables) {
        try {
          await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
          console.log(`✅ Table verified: ${table}`);
        } catch (err) {
          console.log(`⚠️ Missing table: ${table}`);
          missingTables.push(table);
        }
      }
      
      if (missingTables.length === 0) {
        console.log('✅ Database schema verified - all tables exist');
      } else {
        console.log(`⚠️ Missing ${missingTables.length} tables: ${missingTables.join(', ')}`);
        console.log('🔄 Running safe migration...');
        
        try {
          // First try our custom idempotent migration script
          const { execSync } = await import('child_process');
          console.log('🔄 Running idempotent migrations...');
          execSync('tsx scripts/migrate.ts', { 
            stdio: 'inherit',
            timeout: 45000 
          });
          
          // Then sync schema with Drizzle
          console.log('🔄 Syncing schema with Drizzle...');
          execSync('npm run db:push', { 
            stdio: 'inherit',
            timeout: 30000 
          });
          
          console.log('✅ Database migration completed successfully');
        } catch (migrationErr) {
          console.warn('⚠️ Migration failed, creating minimal schema as fallback');
          await createMinimalSchema();
        }
      }
      
      // Ensure admin user exists (idempotent)
      await ensureAdminUser();
      
    } catch (err) {
      console.error('❌ Database initialization failed:', err instanceof Error ? err.message : String(err));
    }
  }
  
  async function createMinimalSchema() {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          subscription_tier VARCHAR(50) DEFAULT 'free',
          subscription_status VARCHAR(50) DEFAULT 'active',
          subscription_expires_at TIMESTAMP,
          monthly_uploads INTEGER DEFAULT 0,
          monthly_upload_limit INTEGER DEFAULT 3,
          last_upload_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          wallet_address VARCHAR(255),
          display_name VARCHAR(255),
          bio TEXT,
          profile_image_url VARCHAR(255),
          website VARCHAR(255),
          location VARCHAR(255),
          is_verified BOOLEAN DEFAULT false,
          follower_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          total_likes INTEGER DEFAULT 0,
          theme_preference VARCHAR(50) DEFAULT 'liquid-glass',
          settings TEXT DEFAULT '{}',
          last_login_at TIMESTAMP,
          is_banned BOOLEAN DEFAULT false,
          ban_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      console.log('✅ Minimal schema created');
    } catch (err) {
      console.error('❌ Failed to create minimal schema:', err instanceof Error ? err.message : String(err));
    }
  }
  
  // Initialize database with timeout
  setTimeout(initializeDatabase, 2000);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 CORS origins: ${JSON.stringify(corsOptions.origin)}`);
    console.log(`📍 Railway PORT binding: ${process.env.PORT ? 'USING process.env.PORT' : 'USING DEFAULT 5000'}`);
  });
})().catch(console.error);