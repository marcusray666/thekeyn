import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import * as blockchainSchema from "@shared/blockchain-schema";

console.log("🔧 Using standard PostgreSQL connection for Railway");

// Configuration validation is handled in environment.ts
import { config } from "./config/environment.js";

// Log DATABASE_URL format for debugging (without credentials)
const dbUrl = config.DATABASE_URL;
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
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
  query_timeout: 15000,
  allowExitOnIdle: false,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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