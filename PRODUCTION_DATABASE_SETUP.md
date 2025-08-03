# Production Database Setup - Railway Deployment

## Issue Identified
The production deployment on Railway is failing because the database schema is not properly synchronized. The error `"relation 'posts' does not exist"` indicates that the production PostgreSQL database is missing critical tables.

## Immediate Fix Required

### Step 1: Connect to Railway Production Database
1. Go to your Railway dashboard
2. Find your PostgreSQL service
3. Go to the "Variables" tab
4. Copy the `DATABASE_URL` connection string

### Step 2: Run Database Migration on Production
You need to run the database migration against the production database. You can do this by:

#### Option A: From Local Environment (Recommended)
1. Temporarily set your production DATABASE_URL:
   ```bash
   export DATABASE_URL="your-production-database-url-from-railway"
   npm run db:push
   ```

#### Option B: Add Migration to Railway Build Process
1. In your Railway service settings, ensure the build command includes:
   ```bash
   npm install && npm run db:push && npm run build
   ```

### Step 3: Verify Tables Exist
After migration, the following tables should exist in production:
- `posts` (for social media posts)
- `post_comments` (for post comments)
- `post_reactions` (for likes/reactions)
- `users` (user accounts)
- `works` (uploaded works)
- `certificates` (blockchain certificates)
- And 27+ other supporting tables

## Current Status
- ✅ **Development Database**: All tables exist, posts creation works
- ❌ **Production Database**: Missing posts table and likely other tables
- ✅ **Code**: TypeScript errors reduced from 170+ to 92, core functionality fixed

## Tables That Must Exist in Production
```sql
-- Critical tables for post creation to work:
posts, post_comments, post_reactions, users, works, certificates, 
notifications, user_follows, subscriptions, session, and others
```

## Next Steps After Database Fix
1. Deploy the updated code to Railway
2. Test post creation in production
3. Test work upload functionality
4. Verify all social features work

## Test Commands to Verify Production
Once database is migrated, test these endpoints in production:
- `GET /api/social/posts` - Should return posts array
- `POST /api/social/posts` - Should create posts successfully
- `POST /api/works` - Should upload works successfully

The core functionality is working in development, the production deployment just needs the database schema synchronized.