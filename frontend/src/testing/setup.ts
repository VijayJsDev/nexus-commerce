/**
 * setup.ts — Vitest global test setup
 *
 * This file runs before EVERY test suite (configured in vite.config.ts → test.setupFiles).
 * It handles three concerns:
 *
 *   1. Jest-DOM matchers — extends expect() with DOM-specific assertions
 *      e.g., expect(button).toBeInTheDocument()
 *           expect(input).toHaveValue('hello')
 *           expect(link).toHaveAttribute('href', '/dashboard')
 *
 *   2. MSW server lifecycle — starts the network interceptor before tests,
 *      resets per-test handler overrides after each test,
 *      and closes cleanly after all tests.
 *
 *   3. RTL cleanup — unmounts React components after each test to prevent
 *      state leaking between tests.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// ─── MSW Server Lifecycle ─────────────────────────────────────────

// Start intercepting requests before any test in the suite runs
beforeAll(() => {
  server.listen({
    // "warn" logs a warning when a request is made with no matching handler.
    // This helps catch accidental API calls not covered by test mocks.
    // Change to "error" if you want unmocked requests to fail tests.
    onUnhandledRequest: 'warn',
  });
});

// Reset handler overrides added via server.use() inside individual tests.
// Without this, a handler added in test A would bleed into test B.
afterEach(() => {
  server.resetHandlers();

  // Unmount React components after each test — prevents memory leaks
  // and DOM accumulation between tests.
  cleanup();
});

// Shut down the server after all tests in the suite complete.
// This frees up the network interceptor and allows the process to exit cleanly.
afterAll(() => {
  server.close();
});
