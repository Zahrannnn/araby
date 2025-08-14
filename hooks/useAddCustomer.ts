'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi, queryKeys } from '@/lib/api';

interface UseAddCustomerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for adding a new customer
 */
export function useAddCustomer(options: UseAddCustomerOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'customers';
        }
      });
      
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error creating customer:', error);
      
      onError?.(error);
    },
  });
} 