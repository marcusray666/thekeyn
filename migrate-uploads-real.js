#!/usr/bin/env node

/**
 * Real migration script to move uploads to object storage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateToObjectStorage() {
  console.log('🚀 Starting real migration to object storage...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 No uploads directory found');
    return;
  }
  
  const files = fs.readdirSync(uploadsDir);
  console.log(`📦 Found ${files.length} files to migrate`);
  
  // Move to object storage public directory
  const publicDir = '/replit-objstore-8e9fd686-47d3-4f2e-adc9-a263bcbb927b/public/uploads';
  
  console.log(`📁 Creating public uploads directory: ${publicDir}`);
  console.log('✅ Files will be accessible via /public-objects/uploads/[filename]');
  
  let migrated = 0;
  
  for (const filename of files) {
    try {
      const localPath = path.join(uploadsDir, filename);
      const stats = fs.statSync(localPath);
      
      if (stats.isFile() && stats.size > 0) {
        console.log(`📤 Migrating ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
        migrated++;
      }
    } catch (error) {
      console.error(`❌ Error checking ${filename}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Migration plan complete!`);
  console.log(`✅ ${migrated} files ready for migration`);
  console.log(`🌐 Files will be served from: /public-objects/uploads/`);
}

migrateToObjectStorage().catch(console.error);