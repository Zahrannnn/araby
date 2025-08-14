/**
 * Common API types and interfaces
 */

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Generic search parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
} 