/**
 * axios.ts — Configured Axios HTTP client
 *
 * This module exports a single Axios instance used by all API calls in the app.
 * Centralising configuration here means:
 *   - baseURL is set once (from env.apiUrl)
 *   - Auth token is injected on every outgoing request automatically
 *   - Error responses are normalised to ApiError before reaching components
 *   - 401 responses trigger auth store reset in one place
 *
 * Usage:
 *   import { apiClient } from '@/lib/axios';
 *   const { data } = await apiClient.get<ApiResponse<Product[]>>('/api/products');
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types';
import { ApiError } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';

// ─── Create Instance ─────────────────────────────────────────────

export const apiClient = axios.create({
  // In development, Vite proxies /api/* to http://localhost:5000.
  // In production, the Nginx config proxies /api/* to the backend container.
  // Using a relative base URL works in both environments.
  baseURL: '/',

  // Default headers applied to every request
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  // 15 seconds — a generous timeout for SaaS API calls
  timeout: 15_000,

  // Send cookies with cross-origin requests (needed for session-based auth)
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────
//
// Runs before every outgoing request.
// Reads the auth token from localStorage and attaches it as a Bearer header.
//
// NOTE: When the Zustand auth store is implemented, this will read from the
// store instead of localStorage directly. The store uses localStorage for
// persistence, so the value is the same — this just avoids a circular dep
// between axios.ts and the auth store during the foundation phase.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (token !== null && token.length > 0) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────
//
// Runs after every response (success or error).
// On error: normalises AxiosError → ApiError with a consistent shape.
// On 401:   clears the stored auth token (user session expired).

apiClient.interceptors.response.use(
  // ✅ Success path — pass through unchanged
  (response) => response,

  // ❌ Error path — normalise to ApiError
  (error: unknown) => {
    // Network error (no response at all — backend is down, user is offline)
    if (!axios.isAxiosError(error)) {
      return Promise.reject(
        new ApiError('An unexpected error occurred', 0)
      );
    }

    const axiosError = error as AxiosError<ApiErrorResponse>;

    // No response received (network timeout, server unreachable)
    if (axiosError.response === undefined) {
      return Promise.reject(
        new ApiError(
          'Unable to reach the server. Please check your connection.',
          0
        )
      );
    }

    const { status, data } = axiosError.response;

    // 401 Unauthorized — session expired or invalid token
    if (status === 401) {
      // Clear stale token — user must log in again
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

      // NOTE: Auth store reset + redirect will be added when auth feature
      // is implemented (to avoid circular imports at the foundation stage)
    }

    // Normalise to ApiError using the backend's error response shape
    const message = data?.message ?? axiosError.message ?? 'Request failed';
    const code = data?.code;
    const errors = data?.errors;

    return Promise.reject(new ApiError(message, status, { code, errors }));
  }
);

export default apiClient;
