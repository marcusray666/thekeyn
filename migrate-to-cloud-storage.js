#!/usr/bin/env node

/**
 * Migration script to move existing uploads to cloud storage
 * This script will:
 * 1. Upload all local files to cloud storage
 * 2. Update database records to point to cloud storage
 * 3. Ensure future uploads go directly to cloud storage
 */

const fs = require('fs');
const path = require('path');
const { ObjectStorageService } = require('./server/objectStorage.js');

async function migrateLocalFilesToCloud() {
  console.log('🚀 Starting migration of local files to cloud storage...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const objectStorageService = new ObjectStorageService();
  
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
        console.log(`📤 Uploading ${filename}...`);
        
        // Get upload URL from object storage
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        
        // Read file and upload to cloud storage
        const fileBuffer = fs.readFileSync(localPath);
        
        // Upload the file using the presigned URL
        const response = await fetch(uploadURL, {
          method: 'PUT',
          body: fileBuffer,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        
        if (response.ok) {
          // Normalize the path
          const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
          console.log(`✅ Migrated ${filename} -> ${objectPath}`);
          migrated++;
          
          // TODO: Update database records to use cloud storage path
          // This would require database connection and update queries
          
        } else {
          console.error(`❌ Failed to upload ${filename}: ${response.statusText}`);
          errors++;
        }
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
if (require.main === module) {
  migrateLocalFilesToCloud().catch(console.error);
}

module.exports = { migrateLocalFilesToCloud };