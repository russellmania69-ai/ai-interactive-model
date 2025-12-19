import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  plugins: [
    react()
  ].filter(Boolean),
  build: {
    sourcemap: true,
    // Improve chunking to avoid very large single bundles
    rollupOptions: {
      output: {
        // Collapse all node_modules into a single vendor chunk to avoid
        // circular initialization between split vendor chunks (react/vendor).
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 700
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
