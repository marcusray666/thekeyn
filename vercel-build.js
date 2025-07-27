#!/usr/bin/env node
// Vercel build script to ensure frontend-only deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting frontend-only build for Vercel...');

// Change to client directory
process.chdir(path.join(__dirname, 'client'));

console.log('📦 Installing frontend dependencies...');
execSync('npm ci', { stdio: 'inherit' });

console.log('🏗️ Building frontend application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ Frontend build completed successfully!');