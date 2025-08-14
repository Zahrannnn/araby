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
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
    retry: (failureCount, error) => {
      console.error('Dashboard fetch error:', error);
      
      if (error && 'response' in error && typeof error.response === 'object' && error.response) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000,
    
    refetchIntervalInBackground: false,
  });
} 