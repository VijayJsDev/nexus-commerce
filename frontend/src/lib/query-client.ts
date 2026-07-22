/**
 * query-client.ts — TanStack Query global client configuration
 *
 * A single QueryClient instance is created here and shared across the app
 * via QueryClientProvider in AppProviders.tsx.
 *
 * Why these specific defaults?
 *
 *   staleTime: 5 minutes
 *     Data is considered "fresh" for 5 minutes after fetching.
 *     During this window, no background refetch occurs. After it expires,
 *     the next component mount or window focus will trigger a refetch.
 *     → Reduces API load on SaaS dashboards with many mounted queries.
 *
 *   gcTime: 10 minutes (formerly cacheTime)
 *     Unused (unmounted) query data is kept in cache for 10 minutes.
 *     If the user navigates away and returns within 10 minutes, they see
 *     cached data instantly while a background refetch occurs.
 *
 *   retry: 1
 *     On a failed request, TanStack Query retries once before surfacing
 *     the error to the component. Avoids hammering a temporarily down API,
 *     but doesn't silently retry forever.
 *
 *   retryDelay: exponential backoff
 *     First retry: 1s, second: 2s, third: 4s... capped at 30s.
 *     Standard backoff strategy for transient network failures.
 *
 *   refetchOnWindowFocus: false
 *     By default, TanStack Query refetches when the browser tab regains focus.
 *     For SaaS dashboards, this causes unexpected loading states when users
 *     switch between tabs. Disabled globally — enable per-query if needed.
 *
 *   refetchOnReconnect: true
 *     Refetch when the user's network connection is restored. Keeps data
 *     fresh after offline periods.
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes — data freshness window
      staleTime: 5 * 60 * 1000,

      // 10 minutes — how long to keep unused cached data
      gcTime: 10 * 60 * 1000,

      // Retry once on failure before showing error state
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors — they won't resolve with retrying
        // (e.g., 401 Unauthorized, 403 Forbidden, 404 Not Found)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry once for network errors and 5xx server errors
        return failureCount < 1;
      },

      // Exponential backoff: 1000ms, 2000ms (capped at 30s)
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30_000),

      // Disabled — prevents unexpected loading states in dashboard tabs
      refetchOnWindowFocus: false,

      // Re-fetch when network reconnects after being offline
      refetchOnReconnect: true,
    },

    mutations: {
      // Don't retry mutations — they may not be idempotent.
      // A failed POST should not be automatically re-sent.
      retry: false,
    },
  },
});
