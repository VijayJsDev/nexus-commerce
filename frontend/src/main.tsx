/**
 * main.tsx — Application entry point
 *
 * This is the only file that calls ReactDOM.createRoot().
 * It is intentionally minimal — all configuration lives in
 * AppProviders (providers) and router/index.tsx (routing).
 *
 * React 19 + StrictMode:
 *   StrictMode renders components twice in development to detect
 *   side effects and deprecated API usage. It has no effect in production.
 *   Keep it enabled — it catches subtle bugs early.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';
import './index.css'; // Tailwind v4 base + design tokens

// ─── Mount ───────────────────────────────────────────────────────

const rootElement = document.getElementById('root');

if (rootElement === null) {
  // This should never happen if index.html has <div id="root">
  throw new Error(
    '[main.tsx] Root element #root not found in the document. ' +
    'Check that index.html contains <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
