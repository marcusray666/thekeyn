import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import * as blockchainSchema from "@shared/blockchain-schema";

console.log("🔧 Using standard PostgreSQL connection for Railway");

// Security: Only debug in development
if (process.env.NODE_ENV !== 'production') {
  console.log("🔍 Environment check:");
  console.log("  NODE_ENV:", process.env.NODE_ENV);
  console.log("  DATABASE_URL exists:", !!process.env.DATABASE_URL);
}

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

// Standard PostgreSQL pool configuration for Railway
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
  query_timeout: 15000,
  allowExitOnIdle: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema: { ...schema, ...blockchainSchema } });

// Test database connection and verify schema on startup with better error handling
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    
    // Check if users table exists
    try {
      const result = await client.query("SELECT COUNT(*) FROM users LIMIT 1");
      console.log("✅ Database schema verified - users table exists");
    } catch (err) {
      console.warn("⚠️ Database schema missing - users table not found");
      console.log("🔧 Schema will be created automatically when needed");
    }
    
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err instanceof Error ? err.message : String(err));
    console.log("🔧 Application will continue, database will be retried automatically");
  }
}

// Test connection without blocking startup
testConnection();