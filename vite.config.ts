import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      // Avoid scanning scratch/*.html files that include external Shopify theme imports.
      entries: ['index.html'],
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://cdpwpggnjdknryhkjccd.supabase.co',
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHdwZ2duamRrbnJ5aGtqY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODgwMjMsImV4cCI6MjA5NTA2NDAyM30.bfIb6kURk3B7R1fUgt99PdDmHatPnTYmGpL7yDliM3g',
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('react-router') || id.includes('react-dom') || /[/\\]react[/\\]/.test(id)) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Forward /api → local Vercel dev or another backend (optional). Prefer `vercel dev` for full stack.
      ...(env.VITE_DEV_API_PROXY
        ? {
            proxy: {
              '/api': {
                target: env.VITE_DEV_API_PROXY,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
  };
});
