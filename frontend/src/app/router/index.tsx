/**
 * index.tsx — Application router
 *
 * Uses React Router v6's createBrowserRouter (Data Router API).
 * This is the recommended approach for React Router v6.4+:
 *   - Enables data loading (loader functions) per route in the future
 *   - Supports error boundaries per route (errorElement)
 *   - Works with React 19's concurrent features
 *
 * Current structure: single root route with a placeholder.
 * As features are built, this expands to nested layouts:
 *
 *   / (RootLayout)
 *   ├── /login         (AuthLayout)
 *   ├── /register      (AuthLayout)
 *   └── /dashboard     (AppLayout — protected)
 *       ├── /products  (ProductsPage)
 *       └── /orders    (OrdersPage)
 */

import { createBrowserRouter } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ROUTES } from './routes';

// ─── Placeholder Root Component ───────────────────────────────────
// Renders a minimal themed page that proves the entire stack is wired:
// React renders → providers wrap → router resolves → component displays.
// Uses Tailwind semantic tokens (bg-background, text-foreground, etc.)
// so it automatically adapts to light / dark mode.
// Replace with real layout components as features are built.

// eslint-disable-next-line react-refresh/only-export-components -- router file intentionally exports both component and config
function RootPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* ── Theme toggle — top-right corner ─────────────────────── */}
      <div className="absolute top-5 right-6">
        <ThemeToggle />
      </div>

      {/* ── Hero content ────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Brand mark */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg">
          <span className="text-3xl select-none">⚡</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Nexus Commerce
          </h1>
          <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
            Frontend foundation is ready.{' '}
            <span className="text-foreground font-medium">Start building features.</span>
          </p>
        </div>

        {/* ── Stack chip ──────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {['React 19', 'Tailwind v4', 'Zustand', 'TanStack Query', 'Vite'].map(
            (tech) => (
              <span
                key={tech}
                className="
                  rounded-full border border-border bg-card
                  px-3 py-1 text-xs font-medium text-card-foreground
                  shadow-card transition-colors duration-200
                  hover:bg-accent hover:text-accent-foreground
                "
              >
                {tech}
              </span>
            ),
          )}
        </div>

        {/* ── File reference ──────────────────────────────────────── */}
        <code className="rounded-lg bg-muted px-4 py-2 text-sm font-mono text-muted-foreground border border-border">
          src/app/router/index.tsx
        </code>
      </div>
    </div>
  );
}

// ─── Router Definition ────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootPage />,
    // errorElement: <ErrorBoundaryPage /> — add when building real pages
  },
  {
    // Catch-all: any unmatched URL shows a 404 page
    path: ROUTES.NOT_FOUND,
    element: (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    ),
  },
]);
