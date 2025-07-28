#!/bin/bash
set -e

echo "Starting build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm ci

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm ci && cd ..

# Build client
echo "Building client..."
cd client && npm run build && cd ..

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create uploads directory
mkdir -p uploads

echo "Build completed successfully!"
echo "Built files:"
ls -la dist/
ls -la client/dist/