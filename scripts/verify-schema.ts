// scripts/verify-schema.ts
// Idempotent schema verification for Railway deployments
import 'dotenv/config';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

interface TableInfo {
  table_name: string;
  column_count: number;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

async function verifySchema() {
  console.log('🔍 Verifying database schema integrity...');
  
  try {
    // Check critical tables exist
    const criticalTables = [
      'users', 'works', 'certificates', 'posts', 'likes', 'comments', 'follows',
      'user_background_preferences', 'background_interactions', 'conversations', 'messages'
    ];
    
    const existingTablesResult = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const existingTables = existingTablesResult.rows as TableInfo[];
    const tableNames = existingTables.map(t => t.table_name);
    
    console.log(`📊 Found ${existingTables.length} tables in database:`);
    existingTables.forEach(table => {
      console.log(`  ✅ ${table.table_name} (${table.column_count} columns)`);
    });
    
    // Check for missing critical tables
    const missingTables = criticalTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing ${missingTables.length} critical tables:`);
      missingTables.forEach(table => console.log(`  ❌ ${table}`));
      return { status: 'incomplete', missingTables, existingTables: tableNames };
    }
    
    // Verify background preferences tables specifically
    const bgPrefsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_background_preferences' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    const bgInteractionsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable  
      FROM information_schema.columns
      WHERE table_name = 'background_interactions' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('🎨 Background preferences table structure:');
    bgPrefsResult.rows.forEach((col: ColumnInfo) => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ''}`);
    });
    
    console.log('📊 Background interactions table structure:');
    bgInteractionsResult.rows.forEach((col: ColumnInfo) => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ''}`);
    });
    
    // Test data access
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const workCount = await pool.query('SELECT COUNT(*) as count FROM works');
    const prefCount = await pool.query('SELECT COUNT(*) as count FROM user_background_preferences');
    const interactionCount = await pool.query('SELECT COUNT(*) as count FROM background_interactions');
    
    console.log('📈 Data counts:');
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log(`  Works: ${workCount.rows[0].count}`);
    console.log(`  Background Preferences: ${prefCount.rows[0].count}`);
    console.log(`  Background Interactions: ${interactionCount.rows[0].count}`);
    
    console.log('✅ Schema verification complete - all critical tables present');
    return { 
      status: 'complete', 
      existingTables: tableNames, 
      dataCounts: {
        users: userCount.rows[0].count,
        works: workCount.rows[0].count,
        preferences: prefCount.rows[0].count,
        interactions: interactionCount.rows[0].count
      }
    };
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error instanceof Error ? error.message : String(error));
    return { status: 'error', error: error instanceof Error ? error.message : String(error) };
  }
}

// Run verification
verifySchema()
  .then(result => {
    console.log('🎯 Verification result:', result.status);
    if (result.status === 'incomplete') {
      process.exit(1);
    }
  })
  .catch(() => process.exit(1))
  .finally(async () => {
    await pool.end();
  });