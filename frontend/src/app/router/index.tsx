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
import { ROUTES } from './routes';

// ─── Placeholder Root Component ───────────────────────────────────
// Renders a minimal page that proves the entire stack is wired correctly:
// React renders → providers wrap → router resolves → component displays.
// Replace with real layout components as features are built.

// eslint-disable-next-line react-refresh/only-export-components -- router file intentionally exports both component and config
function RootPage(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        gap: '12px',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
        🚀 Nexus Commerce
      </h1>
      <p style={{ color: '#6b7280' }}>
        Frontend foundation is ready. Start building features.
      </p>
      <code
        style={{
          background: '#f3f4f6',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.875rem',
        }}
      >
        src/app/router/index.tsx
      </code>
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          gap: '8px',
        }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>404</h1>
        <p style={{ color: '#6b7280' }}>Page not found</p>
      </div>
    ),
  },
]);
