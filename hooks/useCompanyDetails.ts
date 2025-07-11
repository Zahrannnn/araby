'use client';

import { useQuery } from '@tanstack/react-query';
import { superAdminApi, queryKeys, type CompanyDetailsResponse } from '@/lib/api';

/**
 * Custom hook for fetching company details
 */
export function useCompanyDetails(companyId: number | null) {
  return useQuery({
    queryKey: queryKeys.companyDetails(companyId || 0),
    queryFn: () => superAdminApi.getCompanyDetails(companyId!),
    enabled: !!companyId, // Only run query if companyId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
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

export type { CompanyDetailsResponse }; 