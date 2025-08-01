#!/bin/bash

# Railway build script for unified architecture
echo "🔧 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build frontend with Vite using inline config to avoid path issues
echo "🏗️ Building frontend..."
npx vite build --config /dev/stdin << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/app/client/src",
      "@shared": "/app/shared", 
      "@assets": "/app/attached_assets",
    },
  },
  root: "/app/client",
  build: {
    outDir: "/app/dist/public",
    emptyOutDir: true,
  },
});
EOF

# Build backend with esbuild
echo "⚙️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed successfully!"