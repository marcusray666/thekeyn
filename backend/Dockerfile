FROM node:22.16.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 10000

# Start command
CMD ["npx", "tsx", "src/index.ts"]