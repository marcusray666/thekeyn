#!/bin/bash

# Railway build script for unified architecture
echo "🔧 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build frontend with production config that avoids import.meta.dirname
echo "🏗️ Building frontend..."
npx vite build --config vite.config.production.ts --outDir dist/public

# Build backend with esbuild
echo "⚙️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Push database schema to production
echo "🗃️ Setting up production database..."
if [ -n "$DATABASE_URL" ]; then
  echo "📊 Running database migrations..."
  NODE_ENV=production npx drizzle-kit push --verbose || echo "⚠️ Database push failed - will retry at runtime"
  
  # Also create the setup script for runtime execution
  echo "📋 Creating database setup script..."
  chmod +x scripts/setup-database.js || echo "⚠️ Could not make setup script executable"
else
  echo "🔧 Skipping database setup - no DATABASE_URL"
fi

echo "✅ Build completed successfully!"