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
import { Header } from '@/components/ui/Header';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { ProductHorizontalScrolling } from '@/components/ui/ProductHorizontalScrolling';

// ─── Placeholder Root Component ───────────────────────────────────
// Renders a minimal themed page that proves the entire stack is wired:
// React renders → providers wrap → router resolves → component displays.
// Uses Tailwind semantic tokens (bg-background, text-foreground, etc.)
// so it automatically adapts to light / dark mode.
// Replace with real layout components as features are built.

// eslint-disable-next-line react-refresh/only-export-components -- router file intentionally exports both component and config
function RootPage(): React.JSX.Element {
  return (
    <div>
      <Header />
      <HeroCarousel />
      <ProductHorizontalScrolling />
      <HeroCarousel />
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
