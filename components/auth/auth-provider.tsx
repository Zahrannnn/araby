'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component to handle authentication state initialization
 * This ensures the auth state is properly hydrated from cookies on app startup
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { hasHydrated, initializeAuth } = useAuth();

  useEffect(() => {
    if (hasHydrated) {
      initializeAuth();
    }
  }, [hasHydrated, initializeAuth]);

  return <>{children}</>;
} 