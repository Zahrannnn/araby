'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeApi, queryKeys, type EmployeesResponse, type EmployeeQueryParams, type EmployeeDetails } from '@/lib/api';
import { useMemo } from 'react';

/**
 * Custom hook for fetching employees with pagination and search
 */
export function useEmployees(params: EmployeeQueryParams = {}) {
  // Create stable query key
  const queryKey = useMemo(() => ['employees', params], [params]);

  return useQuery({
    queryKey,
    queryFn: () => employeeApi.getEmployees(params),
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
 * Custom hook for fetching individual employee details
 */
export function useEmployeeDetails(employeeId: number | null) {
  return useQuery({
    queryKey: queryKeys.employeeDetails(employeeId!),
    queryFn: () => employeeApi.getEmployeeDetails(employeeId!),
    enabled: !!employeeId,
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
 * Custom hook for fetching employee tasks
 */
export function useEmployeeTasks(employeeId: number | null) {
  return useQuery({
    queryKey: queryKeys.employeeTasks(employeeId!),
    queryFn: () => employeeApi.getEmployeeTasks(employeeId!),
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for tasks data
    gcTime: 5 * 60 * 1000, // 5 minutes
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