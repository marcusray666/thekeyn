# syntax=docker/dockerfile:1

# ---- build stage ----
FROM node:18-slim AS build
WORKDIR /app

# install deps (including devDeps) and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:18-slim
WORKDIR /app
ENV NODE_ENV=production

# install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy built output and needed runtime assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations

# your package.json prestart will run dist/migrate.js now that it exists
EXPOSE 3000
CMD ["npm", "start"]
