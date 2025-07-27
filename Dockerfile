# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production

# Install client dependencies
WORKDIR /app/client
RUN npm ci --only=production

# Build client
RUN npm run build

# Go back to app root
WORKDIR /app

# Copy source code
COPY . .

# Install esbuild and build server
RUN npm install esbuild
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/index.js"]