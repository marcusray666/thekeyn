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
  const dir = path.resolve('migrations');
  if (!fs.existsSync(dir)) {
    console.log('No migrations folder found, nothing to do.');
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ Applied migration: ${file}`);
    } catch (err: any) {
      const code = err?.code ?? '';
      const msg = String(err?.message ?? '');
      const ignorable =
        code === '42P07' || // duplicate_table
        code === '42710' || // duplicate_object (constraint/index)
        code === '42701' || // duplicate_column
        /already exists/i.test(msg) ||
        /duplicate/i.test(msg);

      if (ignorable) {
        console.log(`⚠️  Skipping ${file}: ${msg.split('\n')[0]}`);
        continue;
      }
      console.error(`❌ Migration ${file} failed: ${msg}`);
      throw err;
    }
  }

  console.log('✅ All migrations processed');
}

run()
  .catch(() => process.exit(1))
  .finally(async () => {
    await pool.end();
  });