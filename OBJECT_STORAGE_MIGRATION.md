# Object Storage Migration Guide

## Problem Fixed
Your platform was losing all uploaded images when redeploying because files were stored locally in the `/uploads` directory, which gets wiped out during deployments.

## Solution Implemented
Switched to **Replit Cloud Object Storage** which persists files across deployments.

## Current Setup Status
✅ **Object Storage Ready**: 
- Bucket ID: `replit-objstore-8e9fd686-47d3-4f2e-adc9-a263bcbb927b`
- Public Path: `/replit-objstore-8e9fd686-47d3-4f2e-adc9-a263bcbb927b/public`
- Private Path: `/replit-objstore-8e9fd686-47d3-4f2e-adc9-a263bcbb927b/.private`

✅ **New Routes Added**:
- `GET /objects/*` - Serve files from cloud storage
- `POST /api/objects/upload` - Get upload URL
- `POST /api/objects/complete` - Complete upload and set permissions

## How It Works

### 1. Upload Process (New)
1. Frontend requests upload URL from `/api/objects/upload`
2. Frontend uploads file directly to cloud storage via presigned URL
3. Frontend calls `/api/objects/complete` to set file permissions
4. File is now accessible via `/objects/upload_id` URL

### 2. File Access (New)
- **Public Files**: `GET /objects/upload_id` (no auth required)
- **Private Files**: `GET /objects/upload_id` (auth required, ACL checked)

### 3. Backward Compatibility
- Old `/uploads/*` routes still work for existing files
- `/api/files/*` routes still work for existing files

## Migration Strategy

### Immediate Action Needed
1. **Update Upload Components**: Replace current upload logic with ObjectUploader component
2. **Update File References**: Change image URLs from `/uploads/filename` to `/objects/upload_id`
3. **Test New Uploads**: Verify new uploads persist after redeploy

### For Existing Files
- Current files in `/uploads/` will continue to work until next deploy
- Consider manual migration of critical files to cloud storage
- Update database references gradually

## Integration Example

```tsx
// Example: Using new ObjectUploader component
import { ObjectUploader } from '@/components/ObjectUploader';

function UploadForm() {
  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', { method: 'POST' });
    const { uploadURL } = await response.json();
    return { method: 'PUT' as const, url: uploadURL };
  };

  const handleComplete = async (result) => {
    const uploadURL = result.successful[0].uploadURL;
    await fetch('/api/objects/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadURL })
    });
  };

  return (
    <ObjectUploader
      onGetUploadParameters={handleGetUploadParameters}
      onComplete={handleComplete}
    >
      Upload File
    </ObjectUploader>
  );
}
```

## Next Steps
1. Update upload forms to use new object storage system
2. Test file uploads and verify they persist after redeploy
3. Gradually migrate critical existing files
4. Remove old upload routes once migration is complete

## Benefits
- ✅ Files persist across deployments
- ✅ Better performance and reliability 
- ✅ Built-in CDN and caching
- ✅ Proper access controls and permissions
- ✅ Scalable for large files and high traffic