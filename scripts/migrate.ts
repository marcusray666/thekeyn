// scripts/migrate.ts
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }, // works with Railway public URL
});

async function run() {
  console.log('🔄 Starting idempotent migration process...');
  console.log(`📍 Database URL format: ${url!.split('@')[1] || 'local'}`);
  
  // Test database connection first
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
  
  // Try multiple potential migration paths for development vs production
  const possiblePaths = [
    path.resolve('migrations'),           // Development
    path.resolve('dist/migrations'),      // Production build
    path.resolve(process.cwd(), 'migrations'), // From working directory
    path.resolve(process.cwd(), 'dist/migrations'), // From working directory dist
  ];
  
  let dir = '';
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      dir = testPath;
      console.log(`📁 Using migrations from: ${dir}`);
      break;
    }
  }
  
  if (!dir) {
    console.log('📁 No migrations folder found, creating essential tables...');
    await createEssentialTables();
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  console.log(`📋 Found ${files.length} migration files: ${files.join(', ')}`);

  let appliedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ Applied migration: ${file}`);
      appliedCount++;
    } catch (err: any) {
      const code = err?.code ?? '';
      const msg = String(err?.message ?? '');
      const ignorable =
        code === '42P07' || // duplicate_table
        code === '42710' || // duplicate_object (constraint/index)  
        code === '42701' || // duplicate_column
        code === '42703' || // undefined_column (when adding IF NOT EXISTS)
        code === '42804' || // datatype_mismatch (when column exists with different type)
        /already exists/i.test(msg) ||
        /duplicate/i.test(msg) ||
        /does not exist/i.test(msg) && /if exists/i.test(sql);

      if (ignorable) {
        console.log(`⚠️  Skipping ${file}: ${msg.split('\n')[0]}`);
        skippedCount++;
        continue;
      }
      console.error(`❌ Migration ${file} failed: ${msg}`);
      throw err;
    }
  }

  console.log(`✅ Migration complete: ${appliedCount} applied, ${skippedCount} skipped`);
}

// Create essential tables if no migrations exist
async function createEssentialTables() {
  try {
    console.log('🏗️  Creating essential schema tables...');
    
    // Create users table with IF NOT EXISTS
    await pool.query(`
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
      )
    `);
    
    console.log('✅ Essential tables created successfully');
  } catch (err) {
    console.error('❌ Failed to create essential tables:', err);
    throw err;
  }
}

run()
  .catch((error) => {
    console.error('❌ Migration process failed:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    });
    process.exit(1);
  })
  .finally(async () => {
    try {
      await pool.end();
      console.log('🔒 Database connection closed');
    } catch (err) {
      console.error('⚠️  Error closing database connection:', err);
    }
  });