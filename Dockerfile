# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies
RUN npm ci

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Go back to app root and copy all source code
WORKDIR /app
COPY . .

# Build client
WORKDIR /app/client
RUN npm run build

# Go back to app root and build server
WORKDIR /app
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/index.js"]