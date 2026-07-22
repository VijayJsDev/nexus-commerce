/**
 * vite.config.ts — Vite build & dev server configuration
 *
 * Vitest config has been moved to vitest.config.ts to avoid a TypeScript
 * conflict: the `test` property does not exist on Vite's UserConfig type
 * without the vitest/config reference types, which pollutes the app config.
 */

import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // ─── React plugin ───────────────────────────────────────────
    // Enables JSX transform, React Fast Refresh (HMR for components),
    // and Babel transforms for React-specific optimizations.
    react(),

    // ─── Tailwind CSS v4 ────────────────────────────────────────
    // The official Vite plugin for Tailwind v4. Replaces the old
    // postcss + autoprefixer setup entirely. No tailwind.config.js needed.
    tailwindcss(),
  ],

  // ─── Path Aliases ─────────────────────────────────────────────
  // "@" maps to the "src/" directory. Must match "paths" in tsconfig.app.json.
  // Usage: import { cn } from '@/lib/utils'  (instead of '../../../lib/utils')
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ─── Dev Server ───────────────────────────────────────────────
  server: {
    // Port 3000 — matches Docker port mapping (3000:3000)
    port: 3000,

    // host: true binds to 0.0.0.0 (all network interfaces).
    // Required for Docker: without this, the container's dev server is only
    // reachable on 127.0.0.1 inside the container — the host can't reach it.
    host: true,

    // ─── API Proxy ──────────────────────────────────────────────
    // In development, Vite forwards any request starting with /api to the
    // backend at localhost:5000. This means:
    //   - Your components call: axios.get('/api/products')
    //   - Vite rewrites to:     http://localhost:5000/api/products
    //
    // Benefits:
    //   1. No CORS headers needed on the backend for local dev
    //   2. Components don't need different URLs for dev vs prod
    //   3. Mirrors how Nginx will proxy in production
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // If your backend API routes don't include /api prefix, uncomment:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
