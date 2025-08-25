// Centralized configuration management with environment validation
export interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;
  
  // Session & Security
  SESSION_SECRET: string;
  
  // Payment Processing
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Frontend
  FRONTEND_URL?: string;
  
  // Object Storage (when implemented)
  DEFAULT_OBJECT_STORAGE_BUCKET_ID?: string;
  PRIVATE_OBJECT_DIR?: string;
  PUBLIC_OBJECT_SEARCH_PATHS?: string;
  
  // Optional Services
  OPENAI_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  
  // App Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
}

const REQUIRED_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
] as const;

const OPTIONAL_VARS = [
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'DEFAULT_OBJECT_STORAGE_BUCKET_ID',
  'PRIVATE_OBJECT_DIR', 
  'PUBLIC_OBJECT_SEARCH_PATHS',
  'OPENAI_API_KEY',
  'SENDGRID_API_KEY'
] as const;

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function validateEnvironment(): EnvironmentConfig {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for common misconfigurations
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    warnings.push('STRIPE_SECRET_KEY should start with "sk_"');
  }

  if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    warnings.push('STRIPE_PUBLISHABLE_KEY should start with "pk_"');
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgres')) {
    warnings.push('DATABASE_URL should start with "postgres://" or "postgresql://"');
  }

  // Handle missing required variables
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🔧 Railway deployment fix:');
      console.error('   1. Check Railway service Variables tab');
      console.error('   2. Ensure all required variables are set:');
      missing.forEach(varName => {
        console.error(`      - ${varName}`);
      });
    } else {
      console.error('🔧 Development fix:');
      console.error('   1. Create .env file with required variables:');
      missing.forEach(varName => {
        console.error(`      ${varName}=your_value_here`);
      });
      console.error('   2. Check .env.example for reference');
    }
    
    throw new ConfigurationError(errorMessage);
  }

  // Log warnings in development
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Return validated config
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    FRONTEND_URL: process.env.FRONTEND_URL,
    DEFAULT_OBJECT_STORAGE_BUCKET_ID: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID,
    PRIVATE_OBJECT_DIR: process.env.PRIVATE_OBJECT_DIR,
    PUBLIC_OBJECT_SEARCH_PATHS: process.env.PUBLIC_OBJECT_SEARCH_PATHS,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: process.env.PORT || '5000'
  };
}

// Validate and export configuration
export const config = validateEnvironment();

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof EnvironmentConfig): boolean {
  return !!config[feature];
}

// Environment-specific configurations
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Log configuration status (non-sensitive info only)
if (isDevelopment) {
  console.log('✅ Configuration validated successfully');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Features enabled: ${OPTIONAL_VARS.filter(v => config[v]).join(', ') || 'none'}`);
}