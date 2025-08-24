#!/usr/bin/env node

// Direct database schema setup for Railway production
import { execSync } from 'child_process';
import { Pool } from 'pg';

console.log('🗃️ Setting up database schema for production...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

try {
  // Test connection first
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  console.log('✅ Database connection successful');
  
  // Check if users table exists
  try {
    const result = await client.query("SELECT COUNT(*) FROM users LIMIT 1");
    console.log('✅ Database schema already exists');
    client.release();
    pool.end();
    process.exit(0);
  } catch (err) {
    console.log('❌ Database schema missing, creating...');
  }
  
  client.release();
  pool.end();
  
  // Run drizzle-kit push to create schema
  console.log('📊 Running drizzle-kit push...');
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Database schema created successfully');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}