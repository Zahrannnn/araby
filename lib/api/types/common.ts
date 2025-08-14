/**
 * Common API types and interfaces
 */


export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}


export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
}


export interface SearchParams extends PaginationParams {
  search?: string;
}


export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
} 