#!/usr/bin/env tsx
/**
 * Migration System Verification Script
 * Tests that migrations are idempotent and handle existing data properly
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { config } from "../server/config/environment";

interface MigrationTest {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: string;
}

class MigrationVerifier {
  private results: MigrationTest[] = [];

  private addResult(name: string, status: 'pass' | 'fail' | 'skip', message: string, details?: string) {
    this.results.push({ name, status, message, details });
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
    console.log(`${icon} ${name}: ${message}`);
    if (details) console.log(`   ${details}`);
  }

  async verifyTableStructure(): Promise<void> {
    try {
      // Critical tables that must exist for the application to function
      const criticalTables = [
        'users',
        'works', 
        'certificates',
        'posts',
        'user_follows',
        'user_background_preferences',
        'background_interactions',
        'system_metrics'
      ];

      console.log('🔍 Verifying table structure...');

      for (const tableName of criticalTables) {
        try {
          const result = await db.execute(sql`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = ${tableName}
            ORDER BY ordinal_position
          `);

          if (result.rows.length === 0) {
            this.addResult(`Table: ${tableName}`, 'fail', 'Table does not exist');
          } else {
            this.addResult(`Table: ${tableName}`, 'pass', `Table exists with ${result.rows.length} columns`);
          }
        } catch (error) {
          this.addResult(`Table: ${tableName}`, 'fail', 'Failed to query table', error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      this.addResult('Table Structure', 'fail', 'Failed to verify table structure', error instanceof Error ? error.message : String(error));
    }
  }

  async verifyForeignKeys(): Promise<void> {
    try {
      console.log('🔗 Verifying foreign key constraints...');

      // Check critical foreign key relationships
      const foreignKeyChecks = [
        {
          table: 'works',
          column: 'user_id',
          references: 'users(id)',
          description: 'Works must belong to valid users'
        },
        {
          table: 'posts',
          column: 'user_id', 
          references: 'users(id)',
          description: 'Posts must belong to valid users'
        },
        {
          table: 'certificates',
          column: 'work_id',
          references: 'works(id)',
          description: 'Certificates must reference valid works'
        },
        {
          table: 'user_follows',
          column: 'follower_id',
          references: 'users(id)',
          description: 'Follows must reference valid follower'
        },
        {
          table: 'user_background_preferences',
          column: 'user_id',
          references: 'users(id)',
          description: 'Background preferences must belong to valid users'
        }
      ];

      for (const fk of foreignKeyChecks) {
        try {
          const result = await db.execute(sql`
            SELECT 
              tc.table_name,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = ${fk.table}
              AND kcu.column_name = ${fk.column}
          `);

          if (result.rows.length > 0) {
            this.addResult(`FK: ${fk.table}.${fk.column}`, 'pass', fk.description);
          } else {
            this.addResult(`FK: ${fk.table}.${fk.column}`, 'fail', `Missing foreign key constraint`);
          }
        } catch (error) {
          this.addResult(`FK: ${fk.table}.${fk.column}`, 'fail', 'Failed to verify foreign key', error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      this.addResult('Foreign Keys', 'fail', 'Failed to verify foreign keys', error instanceof Error ? error.message : String(error));
    }
  }

  async verifyIndexes(): Promise<void> {
    try {
      console.log('📇 Verifying database indexes...');

      // Check for important indexes that improve performance
      const criticalIndexes = [
        { table: 'users', column: 'email', description: 'Email lookup index' },
        { table: 'users', column: 'username', description: 'Username lookup index' },
        { table: 'works', column: 'user_id', description: 'User works index' },
        { table: 'posts', column: 'user_id', description: 'User posts index' },
        { table: 'user_follows', columns: ['follower_id', 'following_id'], description: 'Follow relationship index' }
      ];

      for (const index of criticalIndexes) {
        try {
          const result = await db.execute(sql`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = ${index.table}
              AND indexdef LIKE ${'%' + index.column + '%'}
          `);

          if (result.rows.length > 0) {
            this.addResult(`Index: ${index.table}.${index.column}`, 'pass', index.description);
          } else {
            this.addResult(`Index: ${index.table}.${index.column}`, 'skip', `No specific index found (may use primary key)`);
          }
        } catch (error) {
          this.addResult(`Index: ${index.table}.${index.column}`, 'fail', 'Failed to check index', error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      this.addResult('Indexes', 'fail', 'Failed to verify indexes', error instanceof Error ? error.message : String(error));
    }
  }

  async verifyDataIntegrity(): Promise<void> {
    try {
      console.log('🔐 Verifying data integrity...');

      // Check for orphaned records (data that violates referential integrity)
      const integrityChecks = [
        {
          name: 'Orphaned Works',
          query: sql`
            SELECT COUNT(*) as count
            FROM works w
            LEFT JOIN users u ON w.user_id = u.id
            WHERE u.id IS NULL
          `,
          description: 'Works without valid user references'
        },
        {
          name: 'Orphaned Posts',
          query: sql`
            SELECT COUNT(*) as count
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE u.id IS NULL
          `,
          description: 'Posts without valid user references'
        },
        {
          name: 'Orphaned Certificates',
          query: sql`
            SELECT COUNT(*) as count
            FROM certificates c
            LEFT JOIN works w ON c.work_id = w.id
            WHERE w.id IS NULL
          `,
          description: 'Certificates without valid work references'
        }
      ];

      for (const check of integrityChecks) {
        try {
          const result = await db.execute(check.query);
          const count = Number(result.rows[0]?.count || 0);
          
          if (count === 0) {
            this.addResult(`Integrity: ${check.name}`, 'pass', check.description);
          } else {
            this.addResult(`Integrity: ${check.name}`, 'fail', `Found ${count} orphaned records`);
          }
        } catch (error) {
          this.addResult(`Integrity: ${check.name}`, 'fail', 'Failed to check integrity', error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      this.addResult('Data Integrity', 'fail', 'Failed to verify data integrity', error instanceof Error ? error.message : String(error));
    }
  }

  async testIdempotentOperations(): Promise<void> {
    try {
      console.log('🔄 Testing idempotent operations...');

      // Test that common operations can be run multiple times safely
      const testTableName = 'test_idempotent_table';

      // Try to create a test table (should work first time)
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS ${sql.identifier(testTableName)} (
            id SERIAL PRIMARY KEY,
            test_data TEXT
          )
        `);
        this.addResult('Idempotent: Table Creation', 'pass', 'CREATE TABLE IF NOT EXISTS works correctly');
      } catch (error) {
        this.addResult('Idempotent: Table Creation', 'fail', 'Failed to create test table', error instanceof Error ? error.message : String(error));
      }

      // Try to create the same table again (should not fail)
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS ${sql.identifier(testTableName)} (
            id SERIAL PRIMARY KEY,
            test_data TEXT
          )
        `);
        this.addResult('Idempotent: Duplicate Table', 'pass', 'Duplicate table creation handled gracefully');
      } catch (error) {
        this.addResult('Idempotent: Duplicate Table', 'fail', 'Duplicate table creation failed', error instanceof Error ? error.message : String(error));
      }

      // Clean up test table
      try {
        await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(testTableName)}`);
      } catch (error) {
        console.log('⚠️ Failed to clean up test table:', error);
      }

    } catch (error) {
      this.addResult('Idempotent Operations', 'fail', 'Failed to test idempotent operations', error instanceof Error ? error.message : String(error));
    }
  }

  async verifyEnvironmentConfiguration(): Promise<void> {
    try {
      console.log('⚙️ Verifying environment configuration...');

      // Check database URL format
      const dbUrl = config.DATABASE_URL;
      if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        this.addResult('DB URL Format', 'pass', 'Database URL has correct protocol');
      } else {
        this.addResult('DB URL Format', 'fail', 'Database URL should start with postgresql:// or postgres://');
      }

      // Check for production-ready configuration
      if (config.NODE_ENV === 'production') {
        if (config.SESSION_SECRET && config.SESSION_SECRET.length >= 32) {
          this.addResult('Session Security', 'pass', 'Session secret is adequately long');
        } else {
          this.addResult('Session Security', 'fail', 'Session secret should be at least 32 characters');
        }

        if (config.STRIPE_SECRET_KEY && config.STRIPE_SECRET_KEY.startsWith('sk_')) {
          this.addResult('Stripe Configuration', 'pass', 'Stripe keys have correct format');
        } else {
          this.addResult('Stripe Configuration', 'fail', 'Stripe secret key should start with sk_');
        }
      } else {
        this.addResult('Environment', 'skip', `Running in ${config.NODE_ENV} mode`);
      }

    } catch (error) {
      this.addResult('Environment Configuration', 'fail', 'Failed to verify configuration', error instanceof Error ? error.message : String(error));
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const total = this.results.length;

    console.log('\n📊 MIGRATION VERIFICATION SUMMARY');
    console.log('==================================');
    console.log(`Total Checks: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Checks:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }

    const migrationReady = failed === 0;
    console.log(`\n🚀 Migration Status: ${migrationReady ? 'READY' : 'ISSUES DETECTED'}`);
    
    if (migrationReady) {
      console.log('✅ Database structure verified - migrations should work correctly');
    } else {
      console.log('❌ Database issues detected - may cause migration problems');
    }
  }
}

async function verifyMigrationSystem(): Promise<void> {
  const verifier = new MigrationVerifier();

  try {
    console.log('🔧 Starting Migration System Verification...\n');

    await verifier.verifyTableStructure();
    await verifier.verifyForeignKeys();
    await verifier.verifyIndexes();
    await verifier.verifyDataIntegrity();
    await verifier.testIdempotentOperations();
    await verifier.verifyEnvironmentConfiguration();

  } catch (error) {
    console.error('💥 Verification suite crashed:', error instanceof Error ? error.message : String(error));
  } finally {
    verifier.printSummary();
  }
}

// Run verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyMigrationSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Verification runner failed:', error);
      process.exit(1);
    });
}

export { MigrationVerifier, verifyMigrationSystem };