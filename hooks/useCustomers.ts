'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi, offersApi, tasksApi, queryKeys, type CustomersResponse, type CustomerQueryParams, type TasksResponse } from '@/lib/api';
import { useMemo } from 'react';

/**
 * Custom hook for fetching customers with pagination and search
 */
export function useCustomers(params: CustomerQueryParams = {}) {
  // Create stable query key
  const queryKey = useMemo(() => queryKeys.customers(params), [params]);

  return useQuery({
    queryKey,
    queryFn: () => customerApi.getCustomers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or auth errors
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for fetching a single customer by ID
 */
export function useCustomer(customerId: number | null) {
  return useQuery({
    queryKey: queryKeys.customer(customerId || 0),
    queryFn: () => customerApi.getCustomer(customerId!),
    enabled: !!customerId, 
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: (failureCount, error) => {
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for fetching customer tasks with pagination
 */
export function useCustomerTasks(customerId: number | null, pageIndex: number = 1, pageSize: number = 3) {
  return useQuery({
    queryKey: queryKeys.customerTasks(customerId || 0, { pageIndex, pageSize }),
    queryFn: () => customerApi.getCustomerTasks(customerId!, pageIndex, pageSize),
    enabled: !!customerId, 
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
    retry: (failureCount, error) => {
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for fetching customer offers with pagination
 */
export function useCustomerOffers(customerId: number | null, pageIndex: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: queryKeys.customerOffers(customerId || 0, { pageIndex, pageSize }),
    queryFn: () => customerApi.getCustomerOffers(customerId!, pageIndex, pageSize),
    enabled: !!customerId, 
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
    retry: (failureCount, error) => {
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for fetching detailed offer information
 */
export function useOfferDetails(offerId: number | null) {
  return useQuery({
    queryKey: queryKeys.offerDetails(offerId || 0),
    queryFn: () => offersApi.getOfferDetails(offerId!),
    enabled: !!offerId, 
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: (failureCount, error) => {
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for fetching detailed task information
 */
export function useTaskDetails(taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.taskDetails(taskId || 0),
    queryFn: () => tasksApi.getTaskDetails(taskId!),
    enabled: !!taskId, 
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: (failureCount, error) => {
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for deleting a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'customers';
        }
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting customer:', error);
    },
  });
}

/**
 * Custom hook for updating a customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.updateCustomer,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'customers';
        }
      });
    },
    onError: (error: Error) => {
      console.error('Error updating customer:', error);
    },
  });
} 