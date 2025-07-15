'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, queryKeys } from '@/lib/api';

/**
 * Custom hook for fetching company dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for dashboard data
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Log error for debugging
      console.error('Dashboard fetch error:', error);
      
      // Don't retry on 404 or auth errors
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
    // Refetch when window regains focus for fresh dashboard data
    refetchOnWindowFocus: true,
    // Refetch when coming back online
    refetchOnReconnect: true,
    // Refetch every 5 minutes when the page is visible
    refetchInterval: 5 * 60 * 1000,
    // Only refetch when page is visible
    refetchIntervalInBackground: false,
  });
} 