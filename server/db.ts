import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as blockchainSchema from "@shared/blockchain-schema";

// Configure WebSocket for Neon serverless (only for Neon databases)
if (process.env.DATABASE_URL?.includes('neon.tech')) {
  neonConfig.webSocketConstructor = ws;
} else {
  // For Railway/standard PostgreSQL, don't configure Neon settings
  console.log("🔧 Using standard PostgreSQL connection (not Neon)");
}

// Debug environment variables for Railway deployment
console.log("🔍 Environment check:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  DATABASE_URL exists:", !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is missing!");
  if (process.env.NODE_ENV === 'production') {
    console.error("🔧 Railway deployment fix:");
    console.error("   1. Check loggin-fullstack service Variables tab");
    console.error("   2. Ensure DATABASE_URL = ${{loggin-db.DATABASE_URL}}");
    console.error("   3. Verify loggin-db PostgreSQL service is running");
  } else {
    console.error("🔧 Development fix:");
    console.error("   1. Go to Secrets tab (🔒 icon in sidebar)");
    console.error("   2. Add DATABASE_URL with your PostgreSQL connection string");
    console.error("   3. Restart your Repl");
  }
  throw new Error("DATABASE_URL must be set. Check Railway variables or Replit Secrets.");
}

// Log DATABASE_URL format for debugging (without credentials)
const dbUrl = process.env.DATABASE_URL;
const urlProtocol = dbUrl.split('://')[0];
const urlHost = dbUrl.split('@')[1]?.split('/')[0];
console.log("🔗 DATABASE_URL format check:");
console.log("  Protocol:", urlProtocol);
console.log("  Host:Port:", urlHost);

if (urlProtocol !== 'postgresql' && urlProtocol !== 'postgres') {
  console.warn("⚠️  DATABASE_URL should start with postgresql:// or postgres://");
}

if (urlHost && !urlHost.includes(':5432')) {
  console.warn("⚠️  DATABASE_URL should use port 5432 for PostgreSQL");
}

// Enhanced pool configuration for production deployment
const connectionConfig: any = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Add SSL configuration for production environments
if (process.env.NODE_ENV === 'production') {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(connectionConfig);

export const db = drizzle({ client: pool, schema: { ...schema, ...blockchainSchema } });

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
    console.error("🔧 Check your DATABASE_URL in Replit Secrets");
  });