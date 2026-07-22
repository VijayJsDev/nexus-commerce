/**
 * AppProviders.tsx — Root provider composition
 *
 * Wraps the entire application in all required React context providers.
 * Provider order matters:
 *   1. QueryClientProvider — wraps all data-fetching components
 *   2. RouterProvider      — renders the route tree
 *   3. Toaster             — renders toast notifications above everything
 *   4. ReactQueryDevtools  — only in development (tree-shaken in production)
 *
 * Theme initialisation is handled by the Zustand theme store on module load
 * (synchronously, before React renders). This prevents the "flash of wrong theme"
 * because the .dark class is applied to <html> before the first paint.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { isDev } from '@/config/env';
import { queryClient } from '@/lib/query-client';
import { router } from '../router/index';

// Importing the theme store triggers its initialisation (applies .dark to DOM)
// synchronously before React's first render — no FOWT.
import '@/store/theme.store';

export function AppProviders(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: 4000 }}
      />

      {/* DevTools are tree-shaken out of production builds by Vite */}
      {isDev && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
