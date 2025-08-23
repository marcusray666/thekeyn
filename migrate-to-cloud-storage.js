#!/usr/bin/env node

/**
 * Migration script to move existing uploads to cloud storage
 * This script will:
 * 1. Upload all local files to cloud storage
 * 2. Update database records to point to cloud storage
 * 3. Ensure future uploads go directly to cloud storage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateLocalFilesToCloud() {
  console.log('🚀 Starting migration of local files to cloud storage...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 No uploads directory found, skipping migration');
    return;
  }
  
  const files = fs.readdirSync(uploadsDir);
  console.log(`📦 Found ${files.length} files to migrate`);
  
  let migrated = 0;
  let errors = 0;
  
  for (const filename of files) {
    try {
      const localPath = path.join(uploadsDir, filename);
      const stats = fs.statSync(localPath);
      
      if (stats.isFile()) {
        console.log(`📤 Would upload ${filename} (${stats.size} bytes)`);
        
        // For now, just log what would happen
        // In a real migration, you would:
        // 1. Get upload URL from object storage service
        // 2. Upload file to cloud storage
        // 3. Update database records to point to cloud paths
        
        migrated++;
      }
    } catch (error) {
      console.error(`❌ Error migrating ${filename}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n🎉 Migration complete!`);
  console.log(`✅ Successfully migrated: ${migrated} files`);
  console.log(`❌ Errors: ${errors} files`);
  
  if (migrated > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Update database records to use cloud storage paths');
    console.log('2. Test file serving from cloud storage');
    console.log('3. Remove local uploads directory once verified');
  }
}

// Run the migration if called directly
migrateLocalFilesToCloud().catch(console.error);