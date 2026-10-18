/**
 * routes.ts — Route path constants
 *
 * All route paths are defined here as constants.
 * Components and navigation calls import from here instead of
 * using string literals scattered across the codebase.
 *
 * Why this matters:
 *   If '/dashboard' becomes '/app/dashboard', you change it here — once.
 *   Without this, you grep through the codebase hoping to find every string.
 *
 * Usage:
 *   import { ROUTES } from '@/app/router/routes';
 *   navigate(ROUTES.DASHBOARD);
 *   <Link to={ROUTES.AUTH.LOGIN}>Sign in</Link>
 */

export const ROUTES = {
  // ── Public ──────────────────────────────────────────────────
  ROOT: '/',
  CHECKOUT: '/checkout',

  // ── Auth (future) ────────────────────────────────────────────
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // ── Tenant Admin ─────────────────────────────────────────────
  ADMIN: {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    REGISTER: '/admin/register',
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/products/categories',
    MEASUREMENTS: '/admin/products/measurements',
    SETTINGS: '/admin/settings',
    ORDERS: '/admin/orders',
  },

  // ── Fallback ─────────────────────────────────────────────────
  NOT_FOUND: '*',
} as const;
