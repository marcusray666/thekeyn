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

echo "✅ Build completed successfully!"