'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UseLoginOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { redirectTo = '/dashboard', onSuccess, onError } = options;
  const [formError, setFormError] = useState<string>('');
  const router = useRouter();
  const { login, setLoading } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      setFormError('');
      setLoading(true);
      
      try {
        const response = await authApi.login(
          { email: data.email, password: data.password },
          data.rememberMe || false
        );
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update store with user data
      login(data.user, data.token);
      setLoading(false);
      
      // Call success callback if provided
      onSuccess?.();
      
      // Redirect to dashboard
      router.push(redirectTo);
    },
    onError: (error: Error) => {
      setLoading(false);
      const errorMessage = error.message || 'An unexpected error occurred';
      setFormError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return {
    handleLogin,
    isLoading: loginMutation.isPending,
    error: formError,
    clearError: () => setFormError(''),
  };
} 