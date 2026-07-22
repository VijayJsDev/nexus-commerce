/**
 * vitest.config.ts — Vitest test runner configuration
 *
 * Kept separate from vite.config.ts to avoid TypeScript type conflicts.
 * Uses mergeConfig to inherit ALL Vite plugins, path aliases, and environment
 * settings from vite.config.ts automatically.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // globals: true — expose describe(), it(), expect(), vi() globally.
      // No need to import them in every test file (mirrors Jest behaviour).
      globals: true,

      // jsdom simulates a browser DOM in Node.js.
      // Required for React Testing Library — components need document, window, etc.
      environment: 'jsdom',

      // Setup file runs before every test suite.
      // It: extends expect() with jest-dom matchers + starts the MSW server.
      setupFiles: ['./src/testing/setup.ts'],

      // ─── Coverage ─────────────────────────────────────────────
      // V8 provider uses Node's built-in coverage — no Babel/Istanbul needed.
      coverage: {
        provider: 'v8',
        // text: terminal summary, html: browsable report, lcov: CI integration
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/testing/**', // Test utilities themselves aren't "coverage"
          'src/**/*.d.ts', // Type declaration files
          'src/main.tsx', // Entry point — nothing to unit test here
          'src/app/router/**', // Route config — tested via integration tests
        ],
      },
    },
  })
);
