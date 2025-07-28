import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as blockchainSchema from "@shared/blockchain-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is missing!");
  console.error("🔧 To fix this:");
  console.error("   1. Go to Railway dashboard");
  console.error("   2. Right-click canvas → Database → Add PostgreSQL");
  console.error("   3. Railway will auto-connect the database");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema: { ...schema, ...blockchainSchema } });