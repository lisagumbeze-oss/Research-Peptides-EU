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
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
