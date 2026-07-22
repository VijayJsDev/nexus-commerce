/**
 * constants.ts — Application-wide constants
 *
 * Centralising magic numbers, strings, and enums here means:
 *   - One place to change a value (e.g., DEFAULT_PAGE_SIZE: 20 → 50)
 *   - TypeScript enforces correct values at every call site
 *   - Prevents typos in string literals spread across the codebase
 */

// ─── Theme ─────────────────────────────────────────────────────

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

/** Union type of valid theme values: "light" | "dark" | "system" */
export type Theme = (typeof THEME)[keyof typeof THEME];

/** The key used to persist theme preference in localStorage */
export const THEME_STORAGE_KEY = 'nexus-theme' as const;

// ─── API ────────────────────────────────────────────────────────

/** All API endpoints are prefixed here — Vite proxy forwards to backend */
export const API_PREFIX = '/api' as const;

export const API_ROUTES = {
  HEALTH: `${API_PREFIX}/health`,
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    REFRESH: `${API_PREFIX}/auth/refresh`,
    ME: `${API_PREFIX}/auth/me`,
  },
} as const;

// ─── Pagination ─────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── Query Keys ─────────────────────────────────────────────────
// Centralised TanStack Query key factory.
// All cache keys live here — prevents stale cache from mismatched key strings.

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  HEALTH: ['health'] as const,
} as const;

// ─── Local Storage Keys ─────────────────────────────────────────

export const STORAGE_KEYS = {
  THEME: THEME_STORAGE_KEY,
  AUTH_TOKEN: 'nexus-auth-token',
} as const;

// ─── HTTP Status Codes ──────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
