/**
 * index.ts — Types barrel export
 *
 * Re-exports all types from the types/ directory.
 * Import from '@/types' instead of '@/types/api' everywhere in the app.
 *
 * Usage:
 *   import type { ApiResponse, ApiError, BaseEntity } from '@/types';
 */

export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  PaginatedResponse,
  BaseEntity,
  PaginationParams,
} from './api';

export { ApiError } from './api';
