'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, queryKeys, type EmployeeQueryParams } from '@/lib/api/employee';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useMemo } from 'react';

/**
 * Custom hook for fetching employees with pagination and search
 */
export function useEmployees(params: EmployeeQueryParams = {}) {
  const queryKey = useMemo(() => [...queryKeys.employees, params], [params]);

  return useQuery({
    queryKey,
    queryFn: () => employeeApi.getEmployees(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const axiosError = error as { response?: { status?: number } };
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
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const axiosError = error as { response?: { status?: number } };
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

/**
 * Custom hook for deleting an employee
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: () => {
      // Invalidate all employee-related queries to refresh the data
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'employees';
        }
      });
    },
  });
}

/**
 * Custom hook for fetching employee performance data
 */
export function useEmployeePerformance(employeeId: number | null) {
  return useQuery({
    queryKey: queryKeys.employeePerformance(employeeId!),
    queryFn: () => employeeApi.getEmployeePerformance(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
} 

export function useAddEmployee({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      userName: string;
      password: string;
      isActive: boolean;
      permissionIds: number[];
      address?: string;
      city?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.EMPLOYEES, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

/**
 * Custom hook for updating an employee
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      userName: string;
      newPassword?: string;
      isActive: boolean;
      permissionIds: number[];
    }) => {
      const { id, ...updateData } = data;
      
      // Ensure all required fields are strings and not empty
      const payload = {
        ...updateData,
        firstName: updateData.firstName.trim() || "string",
        lastName: updateData.lastName.trim() || "string",
        email: updateData.email.trim() || "string",
        userName: updateData.userName.trim() || "string",
        newPassword: updateData.newPassword?.trim(),
        isActive: updateData.isActive,
        permissionIds: updateData.permissionIds || []
      };

      const response = await apiClient.put(`${API_ENDPOINTS.EMPLOYEES}/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the employees list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employees 
      });
      
      // Invalidate the specific employee's details
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employeeDetails(data.id)
      });
      
      // Invalidate the employee's tasks
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employeeTasks(data.id)
      });
      
      // Invalidate the employee's performance data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employeePerformance(data.id)
      });
    },
  });
} 