
import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
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