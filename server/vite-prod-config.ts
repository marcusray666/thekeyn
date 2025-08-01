// Production-safe Vite configuration for Railway deployment
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Production-safe directory resolution
const getCurrentDir = () => {
  try {
    // Try to get current working directory
    return process.cwd();
  } catch {
    // Fallback to file-based directory resolution
    return path.dirname(fileURLToPath(import.meta.url));
  }
};

const rootDir = getCurrentDir();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  root: path.resolve(rootDir, "client"),
  build: {
    outDir: path.resolve(rootDir, "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});