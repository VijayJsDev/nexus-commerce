/**
 * server.ts — MSW Node server instance
 *
 * Creates the MSW server for use in the Vitest (Node.js) test environment.
 * This is separate from the browser service worker (used in development).
 *
 * The server is started/stopped by setup.ts — not directly imported by tests.
 * Tests interact with it via: import { server } from '@/testing/mocks/server'
 * and call server.use(...) to add per-test handler overrides.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server with all default handlers.
// The server intercepts fetch/XMLHttpRequest calls in Node.js (the test environment).
export const server = setupServer(...handlers);
