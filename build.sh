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
if [ "$NODE_ENV" = "production" ] || [ -n "$DATABASE_URL" ]; then
  echo "📊 Running database migrations..."
  npx drizzle-kit push || echo "⚠️ Database push failed - may need manual setup"
else
  echo "🔧 Skipping database setup in development"
fi

echo "✅ Build completed successfully!"