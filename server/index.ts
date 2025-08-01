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
    
    const distPath = path.resolve(process.cwd(), "dist", "public");
    
    console.log(`Looking for build directory: ${distPath}`);
    console.log('Current working directory:', process.cwd());
    console.log('Available files in root:', fs.readdirSync(process.cwd()));
    
    if (fs.existsSync('dist')) {
      console.log('Contents of dist directory:', fs.readdirSync('dist'));
    }
    
    if (!fs.existsSync(distPath)) {
      // Try alternative locations
      const altPaths = [
        path.resolve(process.cwd(), "client", "dist"),
        path.resolve(process.cwd(), "public"),
        path.resolve(process.cwd(), "build")
      ];
      
      let foundPath = null;
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          console.log(`Found alternative build directory: ${foundPath}`);
          break;
        }
      }
      
      if (foundPath) {
        app.use(express.static(foundPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(foundPath, "index.html"));
        });
      } else {
        console.error(`Could not find any build directory. Checked: ${[distPath, ...altPaths].join(', ')}`);
      }
    } else {
      app.use(express.static(distPath));
      
      // fall through to index.html if the file doesn't exist
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
      
      console.log('📁 Static files configured for production');
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
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS origins: ${JSON.stringify(corsOptions.origin)}`);
  });
})().catch(console.error);