'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, queryKeys, type CreateAppointmentPayload } from '@/lib/api';

interface UseCreateAppointmentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for creating appointments
 */
export function useCreateAppointment(options: UseCreateAppointmentOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsApi.createAppointment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error creating appointment:', error);
      options.onError?.(error);
    },
  });
} 