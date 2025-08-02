import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();

// Enable trust proxy for production deployments
app.set('trust proxy', 1);

// CORS Configuration for separate frontend hosting
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        // Add patterns for common hosting services
        /https:\/\/.*\.vercel\.app$/,
        /https:\/\/.*\.netlify\.app$/,
        /https:\/\/.*\.pages\.dev$/
      ].filter((origin): origin is string | RegExp => origin !== undefined)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
  },
}));

(async () => {
  const server = await registerRoutes(app);

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
    
    // Check multiple possible build locations (Railway uses dist/public)
    const possiblePaths = [
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(process.cwd(), "client", "dist"),
      path.resolve(process.cwd(), "dist"),
      path.resolve(process.cwd(), "public"),
      path.resolve(process.cwd(), "build")
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
  
  // Set NODE_ENV to production if not already set (Railway requirement)
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  // Attempt to create database schema if missing (Railway fix)
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    await setupDatabaseSchema();
  }
  
  async function setupDatabaseSchema() {
    try {
      console.log('🔧 Checking database schema...');
      
      // Quick check if users table exists
      const testClient = await pool.connect();
      try {
        await testClient.query("SELECT COUNT(*) FROM users LIMIT 1");
        console.log('✅ Database schema verified');
        testClient.release();
        return;
      } catch (err) {
        console.log('❌ Database schema missing - attempting to create...');
        testClient.release();
        
        // Create schema using direct SQL commands
        await createDatabaseSchema();
      }
    } catch (err) {
      console.error('⚠️ Schema check failed:', err instanceof Error ? err.message : 'Unknown error');
    }
  }
  
  async function createDatabaseSchema() {
    try {
      console.log('📊 Creating database schema with SQL...');
      const schemaClient = await pool.connect();
      
      // Create users table (core table needed for auth)
      await schemaClient.query(`
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
          settings JSONB DEFAULT '{}',
          last_login_at TIMESTAMP,
          is_banned BOOLEAN DEFAULT false,
          ban_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Database schema created successfully');
      schemaClient.release();
    } catch (schemaErr) {
      console.error('❌ Failed to create schema:', schemaErr instanceof Error ? schemaErr.message : 'Unknown error');
    }
  }
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 CORS origins: ${JSON.stringify(corsOptions.origin)}`);
    console.log(`📍 Railway PORT binding: ${process.env.PORT ? 'USING process.env.PORT' : 'USING DEFAULT 5000'}`);
  });
})().catch(console.error);