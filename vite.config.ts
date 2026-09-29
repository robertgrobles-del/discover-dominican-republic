import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // Animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Data fetching
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // All Radix UI in one chunk
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }
          // Lucide icons - bundle together instead of individual chunks
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // All local assets (images) in one chunk to avoid 30+ tiny image wrapper chunks
          if (id.includes('/src/assets/') && (id.endsWith('.jpg') || id.endsWith('.png') || id.endsWith('.webp'))) {
            return 'assets-images';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
