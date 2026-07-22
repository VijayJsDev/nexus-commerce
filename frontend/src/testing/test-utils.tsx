/**
 * test-utils.tsx — Custom render function with all providers
 *
 * ALWAYS import render and screen from this file, NOT from @testing-library/react.
 *
 * Why? React Testing Library's default render() mounts components with no providers.
 * Our components need QueryClientProvider (for useQuery hooks), MemoryRouter (for
 * useNavigate/useLocation), and potentially others. Without these, components throw
 * context errors in tests.
 *
 * This file:
 *   1. Wraps components in the same providers as AppProviders.tsx (production parity)
 *   2. Re-exports everything from @testing-library/react (so you only need one import)
 *   3. Overrides the `render` export with our custom wrapped version
 *
 * Usage:
 *   // ✅ Correct
 *   import { render, screen, fireEvent } from '@/testing/test-utils';
 *
 *   // ❌ Wrong — missing providers
 *   import { render, screen } from '@testing-library/react';
 */

import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Test-specific QueryClient ────────────────────────────────────
//
// Uses aggressive settings for tests:
//   - No retries (tests should fail fast, not wait for retry delays)
//   - No garbage collection delay (keeps cache clean between tests)

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Fail immediately — no retry delays in tests
        gcTime: Infinity, // Keep cache for the duration of the test
        staleTime: Infinity, // Never re-fetch during a test
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ─── Provider Wrapper ─────────────────────────────────────────────

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps): ReactElement {
  const testQueryClient = createTestQueryClient();

  return (
    // MemoryRouter provides routing context without a real browser URL.
    // Components using useNavigate, useParams, etc. work correctly.
    <MemoryRouter>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
}

// ─── Custom Render ────────────────────────────────────────────────

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>;

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): ReturnType<typeof render> {
  return render(ui, { wrapper: AllProviders, ...options });
}

// ─── Re-exports ───────────────────────────────────────────────────
// Re-exporting everything means test files only need ONE import.
// The overridden `render` is our custom version.

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
// eslint-disable-next-line react-refresh/only-export-components
export { customRender as render };

// eslint-disable-next-line react-refresh/only-export-components
export { createTestQueryClient, AllProviders };
