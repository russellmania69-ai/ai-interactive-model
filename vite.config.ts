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
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;

          // Keep React in its own chunk
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';

          // Supabase in a separate chunk
          if (id.includes('@supabase') || id.includes('supabase')) return 'supabase-vendor';

          // Split a few large libraries into their own chunks to reduce the main vendor size
          if (id.includes('recharts')) return 'recharts-vendor';
          if (id.includes('lucide-react')) return 'icons-vendor';
          if (id.includes('@sentry')) return 'sentry-vendor';

          // Fallback vendor chunk
          return 'vendor';
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
