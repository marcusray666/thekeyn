# Updated Deployment Guide - Durable Systems Edition

## Overview
This updated deployment guide reflects the latest improvements in configuration management, automated testing, and monitoring systems implemented for long-term maintainability.

## 🚀 Pre-Deployment Checklist

### 1. Configuration Validation
```bash
# Verify environment configuration
npm run health-check
# Should output: ✅ Configuration validated successfully
```

### 2. Schema Verification  
```bash
# Check database schema consistency
npm run verify-schema
# Should output: ✅ All tables verified
```

### 3. Integration Testing
```bash
# Test critical user paths
npm run test:integration
# Should pass all authentication, work upload, and social feature tests
```

### 4. Build Verification
```bash
# Ensure clean production build
npm run build
# Should generate dist/index.js and dist/migrate.js without errors
```

## 📋 Railway Deployment Configuration

### Required Environment Variables
Based on centralized configuration validation:

```bash
# Required Variables (Application will not start without these)
DATABASE_URL=${{loggin-db.DATABASE_URL}}
SESSION_SECRET=your-32-character-secret-key
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key

# Optional but Recommended
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=sk-your-openai-key

# System Variables
NODE_ENV=production
PORT=5000
```

### Railway Service Configuration
1. **Database Service**: PostgreSQL with proper foreign key support
2. **Web Service**: Node.js application with environment variables
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start` (includes automatic migrations via prestart)

## 🔧 Migration Handling (Updated)

### Automatic Migrations
- **Prestart Hook**: `node dist/migrate.js` runs before application start
- **Idempotent Design**: Migrations handle existing tables gracefully
- **Error Recovery**: PostgreSQL error codes 42P07, 42710, 42701 are handled
- **Startup Verification**: Application verifies critical tables exist

### Manual Migration (If Needed)
```bash
# Push schema changes (development)
npm run db:push

# Force push (if warnings about data loss)
npm run db:push --force
```

## 📊 Post-Deployment Monitoring

### Immediate Verification (First 30 minutes)
1. **Health Check**
   ```bash
   npm run health-check
   ```
   Should report "All systems healthy"

2. **Schema Validation**
   ```bash
   npm run verify-schema
   ```
   Should confirm all 42 tables exist

3. **Critical Path Testing**
   - User registration/login
   - Work upload and certificate generation
   - Social features (follow/post/like)

### Ongoing Monitoring (Daily/Weekly)
1. **Automated Health Monitoring**
   ```bash
   npm run monitor
   ```
   
2. **Analytics Review**
   - Check system metrics in database
   - Monitor user engagement rates
   - Review content creation trends

3. **Integration Testing**
   ```bash
   npm run test:integration
   ```

## 🚨 Troubleshooting Common Issues

### "Column Does Not Exist" Errors
**Cause**: Schema drift between code and database
**Solution**:
1. Run `npm run verify-schema` to identify missing tables/columns
2. Check `shared/schema.ts` matches actual database structure
3. Use `npm run db:push` to sync schema (development)
4. For production: create proper migration or restore from backup

### Environment Configuration Errors
**Cause**: Missing or invalid environment variables
**Solution**:
1. Application will fail to start with clear error message
2. Check Railway Variables tab for missing/invalid values
3. Verify key formats (sk_, pk_, postgresql://)
4. Run `npm run health-check` after fixes

### Foreign Key Constraint Violations
**Cause**: Data integrity issues or schema mismatches
**Solution**:
1. Review recent data operations
2. Check foreign key relationships in schema
3. Verify test data cleanup procedures
4. Use database constraints to prevent future issues

### Failed Deployments
**Cause**: Build errors or configuration issues
**Solution**:
1. Check build logs for specific errors
2. Verify all dependencies are correctly installed
3. Ensure environment variables are properly set
4. Run local build test: `npm run build`

## 📖 Key Changes from Previous Deployment

### What's New
1. **Centralized Configuration**: Environment validation at startup
2. **Automated Testing**: Integration tests for critical paths
3. **Health Monitoring**: Automated system health checks
4. **Schema Verification**: Startup verification prevents deployment issues
5. **Comprehensive Documentation**: Clear procedures for all scenarios

### Migration Path from Old Deployments
1. **Update Environment Variables**: Add any new required variables
2. **Run Schema Verification**: Ensure database consistency
3. **Test Critical Paths**: Verify core functionality works
4. **Enable Monitoring**: Set up regular health checks

### Build Process Changes
- Use `npm run build` (not build.sh)
- Automatic migration handling via prestart hook
- Clean separation of frontend/backend build artifacts
- Improved error handling and validation

## 🔄 Maintenance Schedule

### Daily
- Automated health monitoring (if cron jobs are set up)
- Review system logs for errors
- Check key performance metrics

### Weekly
- Run full integration test suite
- Review analytics trends and user engagement
- Check for dependency updates

### Monthly
- Comprehensive system review
- Performance optimization analysis
- Documentation updates
- Security audit review

This updated deployment approach ensures reliable, maintainable deployments with early issue detection and clear resolution procedures.