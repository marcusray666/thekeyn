# Development/Production Parity Guide

## Overview
This document outlines the measures implemented to ensure consistency between development and production environments, preventing "works in dev, breaks in prod" scenarios.

## Schema Consolidation (✅ COMPLETED)

### Single Source of Truth
- **Root Schema**: `shared/schema.ts` is the only schema file in the project
- **Vite Alias**: `@shared` points directly to `./shared/` directory
- **Frontend Imports**: All components import types from `@shared/schema`
- **Backend Usage**: Server code uses the same schema definitions

### Eliminated Schema Drift
- Removed duplicate schema files that could diverge
- Updated all frontend components to use actual database field names:
  - `likeCount` instead of `likes`
  - `viewCount` instead of `views`  
  - `mimeType` instead of `fileType`
  - Proper null handling for nullable fields

## Build Configuration

### Railway Deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Build Artifacts**: 
  - `dist/index.js` (371.4kb) - Main application
  - `dist/migrate.js` (3.5kb) - Database migrations
- **Zero Warnings**: Clean build process without compilation errors

### Migration Safety
- Idempotent migrations with PostgreSQL error handling
- Error codes handled: 42P07 (duplicate_table), 42710 (duplicate_object), 42701 (duplicate_column)
- IF NOT EXISTS guards for all DDL operations

## Environment Consistency

### Database Schema
- Production: 42 tables with proper foreign key constraints
- Development: Same schema with identical structure
- Background preferences system: 10 saved preferences, 29 interactions
- All migrations use guarded blocks to prevent duplicates

### Configuration Verification
- Database connection checks on startup
- Schema table verification (users, works, certificates, posts, etc.)
- Environment variable validation
- Production data detection with extra safety measures

## Testing Strategy

### Pre-Deployment Checks
1. **Local Build Test**: `npm run build` must succeed without warnings
2. **Schema Validation**: Verify all tables exist and match expected structure
3. **Type Safety**: LSP diagnostics should show zero errors
4. **Database Migration**: Test migrations work idempotently

### Staging Environment Recommendations
- Use Railway staging environment with dummy database
- Test schema migrations on production-like data structure
- Verify environment variable configuration
- Test both build and runtime processes

## Maintenance Guidelines

### Code Changes
1. Always update `shared/schema.ts` first when changing database structure
2. Run `npm run build` locally to catch type mismatches early
3. Test frontend components use correct field names from schema
4. Verify nullable fields have proper null checks

### Deployment Process
1. Test locally with production database structure
2. Use staging environment for final validation
3. Monitor Railway deployment logs for any schema mismatches
4. Verify all tables and data integrity post-deployment

## Monitoring & Prevention

### Early Warning Signs
- Build warnings about missing properties
- LSP diagnostics showing type mismatches
- Runtime errors about undefined fields
- Database constraint violations

### Regular Audits
- Weekly schema consistency checks
- Monitor build artifact sizes for unexpected changes
- Review LSP diagnostics for any new type safety issues
- Validate environment variable configuration

## Emergency Recovery

### Schema Mismatch Issues
1. Check `shared/schema.ts` matches actual database structure
2. Verify Vite alias `@shared` points to correct directory
3. Rebuild application: `npm run build`
4. Use staging database to test fixes before production

### Configuration Drift
1. Compare development and production environment variables
2. Verify Railway configuration matches package.json scripts
3. Check database connection strings and credentials
4. Validate migration scripts run successfully

## Success Metrics

- ✅ Zero LSP diagnostics errors
- ✅ Clean build process (371.4kb index.js, 3.5kb migrate.js)
- ✅ Single schema source of truth established
- ✅ All frontend components use proper database field names
- ✅ Idempotent migrations with error handling
- ✅ Production deployment ready without warnings

This parity system ensures reliable deployments and prevents the critical schema drift issues that caused past production failures.