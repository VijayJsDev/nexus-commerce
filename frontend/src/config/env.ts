/**
 * env.ts — Typed environment variable access
 *
 * All `import.meta.env.VITE_*` reads go through this single module.
 *
 * Why not read import.meta.env directly in components?
 *   1. TypeScript can't verify VITE_* vars exist at compile time without this.
 *   2. Provides fallback defaults in one place (no scattered nullish coalescing).
 *   3. Makes environment mocking in tests trivial (mock this module, not globals).
 *   4. If a var is renamed, you fix it here — not across the entire codebase.
 */

export const env = {
  /** Base URL of the backend API (proxied to /api in dev via Vite) */
  apiUrl: import.meta.env['VITE_API_URL'] ?? 'http://localhost:5000',

  /** Display name of the application */
  appName: import.meta.env['VITE_APP_NAME'] ?? 'Nexus Commerce',

  /** Current environment — "development" | "production" | "test" */
  nodeEnv: import.meta.env['MODE'] ?? 'development',
} as const;

/** True only in development mode */
export const isDev = env.nodeEnv === 'development';

/** True only in production mode */
export const isProd = env.nodeEnv === 'production';

/** True only in test mode (Vitest sets MODE to "test") */
export const isTest = env.nodeEnv === 'test';
