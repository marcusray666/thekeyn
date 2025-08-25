# Configuration Management & Environment Parity

## Overview
This system implements centralized configuration management to eliminate environment drift and ensure consistent behavior across development, staging, and production environments.

## ✅ Centralized Configuration System

### Core Implementation
- **Config Module**: `server/config/environment.ts` validates all environment variables at startup
- **Validation**: Required variables must be present or application will not start
- **Type Safety**: All configuration is strongly typed with TypeScript interfaces
- **Error Handling**: Clear error messages guide developers on missing configuration

### Required Environment Variables
```typescript
const REQUIRED_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET', 
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
] as const;
```

### Optional Variables (Feature Flags)
```typescript
const OPTIONAL_VARS = [
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'DEFAULT_OBJECT_STORAGE_BUCKET_ID',
  'PRIVATE_OBJECT_DIR',
  'PUBLIC_OBJECT_SEARCH_PATHS',
  'OPENAI_API_KEY',
  'SENDGRID_API_KEY'
] as const;
```

## 🔒 Configuration Validation

### Startup Checks
The system validates configuration on application startup:

```typescript
// Example validation
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  warnings.push('STRIPE_SECRET_KEY should start with "sk_"');
}
```

### Database URL Validation
- ✅ Protocol validation (postgresql:// or postgres://)
- ✅ Port validation (5432 for PostgreSQL)
- ✅ Connection testing at startup

### Stripe Key Validation
- ✅ Secret key format: starts with `sk_`
- ✅ Publishable key format: starts with `pk_`
- ✅ Webhook secret format validation

## 📋 Environment Consistency Checklist

### Development Environment (.env file)
```bash
# Required Variables
DATABASE_URL=postgresql://username:password@host:5432/database
SESSION_SECRET=your-super-secret-session-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Optional Variables  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-api-key-here

# System Variables
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
```

### Production Environment (Railway Variables)
All variables from development must be present with production values:

- ✅ `DATABASE_URL` = `${{loggin-db.DATABASE_URL}}`
- ✅ `SESSION_SECRET` = Generated 32+ character secret
- ✅ `STRIPE_SECRET_KEY` = `sk_live_...` (production key)
- ✅ `STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (production key)
- ✅ `STRIPE_WEBHOOK_SECRET` = Production webhook secret
- ✅ `FRONTEND_URL` = Production domain URL
- ✅ `NODE_ENV` = `production`

### Configuration Drift Prevention

#### Automatic Checks
1. **Startup Validation**: Application won't start with missing required variables
2. **Format Validation**: Keys are checked for proper format (sk_, pk_, whsec_, etc.)
3. **Type Safety**: TypeScript interfaces prevent configuration misuse
4. **Build Process**: npm run build validates configuration access

#### Manual Verification Steps
```bash
# 1. Check .env.example is up to date
diff .env.example .env

# 2. Verify Railway variables match requirements
railway variables

# 3. Test configuration validation
npm run build
```

## 🚀 Deployment Process

### Pre-Deployment Checklist
- [ ] All required variables present in Railway
- [ ] Variable formats validated (sk_, pk_, postgresql://)
- [ ] .env.example updated with new variables
- [ ] Configuration validation passes
- [ ] Build process completes without errors

### New Feature Configuration
When adding new features requiring environment variables:

1. **Add to Environment Interface**:
```typescript
export interface EnvironmentConfig {
  // ... existing config ...
  NEW_SERVICE_API_KEY?: string;
}
```

2. **Update Validation Arrays**:
```typescript
const REQUIRED_VARS = [
  // ... existing vars ...
  'NEW_SERVICE_API_KEY' // if required
] as const;

const OPTIONAL_VARS = [
  // ... existing vars ... 
  'NEW_SERVICE_API_KEY' // if optional
] as const;
```

3. **Update .env.example**:
```bash
# New Service Configuration
NEW_SERVICE_API_KEY=your_api_key_here
```

4. **Update Railway Variables**: Add the variable in Railway dashboard
5. **Test Both Environments**: Verify feature works in dev and production

## 🔍 Monitoring & Alerts

### Configuration Issues Detection
- **Missing Variables**: Application fails to start
- **Invalid Formats**: Warnings logged in development
- **Connection Failures**: Database and service connectivity validated
- **Feature Flags**: Optional services gracefully disabled when keys missing

### Runtime Validation
```typescript
// Example: Check if feature is enabled before using
if (isFeatureEnabled('OPENAI_API_KEY')) {
  // Use OpenAI service
} else {
  // Fallback or disable feature
}
```

## 📖 Developer Guidelines

### Adding New Configuration
1. Add to `EnvironmentConfig` interface
2. Update validation arrays (REQUIRED_VARS or OPTIONAL_VARS)  
3. Add format validation if applicable
4. Update `.env.example`
5. Document in this file
6. Update Railway deployment configuration

### Accessing Configuration
```typescript
// ✅ Use centralized config
import { config } from "./config/environment.js";
const apiKey = config.STRIPE_SECRET_KEY;

// ❌ Don't access process.env directly
const apiKey = process.env.STRIPE_SECRET_KEY;
```

### Environment-Specific Logic
```typescript
import { isDevelopment, isProduction } from "./config/environment.js";

if (isDevelopment) {
  // Development-only features
}

if (isProduction) {
  // Production-only configuration
}
```

This configuration management system ensures consistent behavior across all environments and prevents the "works in dev, breaks in prod" scenarios by validating all configuration at startup.