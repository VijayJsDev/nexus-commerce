/**
 * handlers.ts — MSW API mock handler definitions
 *
 * These handlers intercept HTTP requests during tests and return
 * controlled responses. Handlers are defined once here and applied
 * globally by server.ts.
 *
 * Handler lifecycle in tests:
 *   - Default handlers (defined here) apply to all tests
 *   - Per-test overrides: server.use(http.get('/api/...', () => {...}))
 *   - Overrides are reset after each test (server.resetHandlers() in setup.ts)
 *
 * Adding a new handler:
 *   export const handlers = [
 *     ...existingHandlers,
 *     http.get('/api/products', () => HttpResponse.json({ success: true, data: [] })),
 *   ];
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  // ─── Health Check ──────────────────────────────────────────
  // Validates that the MSW setup is working correctly.
  // A test can call GET /api/health and expect a 200 response.
  http.get('/api/health', () => {
    return HttpResponse.json(
      {
        success: true,
        data: { status: 'ok' },
        message: 'Service is healthy',
      },
      { status: 200 }
    );
  }),

  // ─── Feature handlers will be added here as features grow ──
  // Example (uncomment when auth is implemented):
  //
  // http.post('/api/auth/login', async ({ request }) => {
  //   const body = await request.json();
  //   return HttpResponse.json({
  //     success: true,
  //     data: { token: 'mock-jwt-token', user: { id: '1', email: body.email } },
  //     message: 'Login successful',
  //   });
  // }),
];
