import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production-only Vite configuration for Railway deployment
// Uses absolute paths to avoid import.meta.dirname issues
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
    outDir: "./dist/public",
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});