/**
 * TanStack React Query client configuration
 */
import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

/**
 * Create and configure the query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: Error) => {
        if (error && 'response' in error && typeof error.response === 'object' && error.response) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
}); 