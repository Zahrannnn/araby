'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserRole } from './useUserRole';
import { apiClient, tasksApi } from '@/lib/api';
import type { AxiosError } from 'axios';

/**
 * Custom hook for fetching tasks based on user role
 * Uses /Task/all endpoint for both managers and employees
 * Filtering and pagination are handled client-side
 */
export function useTasks() {
  const { user } = useUserRole();
  
  // Use /Task/all endpoint for all users
  const endpoint = '/Task/all';
  
  // Create stable query key that includes only the endpoint
  const queryKey = ['tasks', endpoint];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(endpoint);
        // /Task/all returns { tasks, stats }
        return { ...data.tasks, stats: data.stats };
      } catch (error) {
        console.error('useTasks fetch error:', error);
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data as { message?: string; error?: string };
          throw new Error(errorData.message || errorData.error || 'Failed to fetch tasks');
        }
        throw new Error('Network error. Please check your connection.');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
    enabled: !!user, // Only run query if user is loaded
  });
}

interface UseAddTaskOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddTask(options: UseAddTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      // Invalidate all queries that start with the tasks key
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'tasks',
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

interface UseUpdateTaskOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateTask(options: UseUpdateTaskOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskItemId: number;
      AssignedToUserId: number;
      CustomerId?: number;
      TaskTitle: string;
      Description: string;
      Priority: string;
      DueDate: string | Date;
      Notes: string;
      requirementFiles?: File[];
    }) => {
      try {
        // Validate required fields
        if (!payload.TaskTitle?.trim()) {
          throw new Error('Task title is required');
        }
        if (!payload.Description?.trim()) {
          throw new Error('Description is required');
        }
        if (!payload.Priority?.trim()) {
          throw new Error('Priority is required');
        }
        if (!payload.Notes?.trim()) {
          throw new Error('Notes is required');
        }
        if (!payload.AssignedToUserId) {
          throw new Error('AssignedToUserId is required');
        }
        if (!payload.DueDate) {
          throw new Error('DueDate is required');
        }

        const formData = new FormData();

        // Add task ID
        formData.append('TaskItemId', payload.taskItemId.toString());

        // Add all task data fields
        formData.append('AssignedToUserId', payload.AssignedToUserId.toString());
        if (payload.CustomerId) {
          formData.append('CustomerId', payload.CustomerId.toString());
        }
        formData.append('TaskTitle', payload.TaskTitle.trim());
        formData.append('Description', payload.Description.trim());
        formData.append('Priority', payload.Priority.trim());
        formData.append('DueDate', new Date(payload.DueDate).toISOString());
        formData.append('Notes', payload.Notes.trim());

        // Add files if provided
        if (payload.requirementFiles?.length) {
          payload.requirementFiles.forEach(file => {
            formData.append('requirementFiles', file);
          });
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        const response = await apiClient.put('/Task', formData, config);
        return response.data;
      } catch (error) {
        console.error('Update task error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to update task');
      }
    },
    onSuccess: () => {
      // Invalidate all tasks queries
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'tasks',
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}