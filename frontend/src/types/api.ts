/**
 * api.ts — Generic API response type shapes
 *
 * These types define the contract between the frontend and backend.
 * They should mirror the response envelope your Express backend sends.
 *
 * Example backend response for GET /api/products:
 * {
 *   "success": true,
 *   "data": [...],
 *   "message": "Products fetched successfully",
 *   "meta": { "total": 150, "page": 1, "pageSize": 20, "totalPages": 8 }
 * }
 */

// ─── Base Response Envelope ─────────────────────────────────────

/** Standard success response wrapping any data shape */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
}

/** Standard error response from the backend */
export interface ApiErrorResponse {
  success: false;
  message: string;
  /** Field-level validation errors (e.g., from Zod on the backend) */
  errors?: Record<string, string[]>;
  /** Error code for programmatic handling (e.g., "UNAUTHORIZED") */
  code?: string;
}

// ─── Pagination ─────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  message: string;
  meta: PaginationMeta;
}

// ─── Error Class ────────────────────────────────────────────────

/**
 * Normalised error thrown by the Axios response interceptor.
 * Components and query functions receive this instead of raw AxiosError.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly errors: Record<string, string[]> | undefined;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      errors?: Record<string, string[]>;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.errors = options?.errors;
  }
}

// ─── Common Entity Types ─────────────────────────────────────────

/** Shared fields present on every persisted entity */
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

/** Pagination query params sent to the API */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
