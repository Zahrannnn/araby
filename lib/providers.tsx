'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { queryClient } from './api';
import { ProjectStatusProvider } from './providers/ProjectStatusProvider';

interface ProvidersProps {
  children: React.ReactNode;
  messages?: Record<string, unknown>;
  locale?: string;
}

/**
 * Hydration boundary component to prevent hydration mismatches
 */
function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Main providers wrapper for the application
 * Includes TanStack Query, NextIntl, and other global providers
 */
export function Providers({ children, messages, locale = 'en' }: ProvidersProps) {
  return (
    <HydrationBoundary>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          {/* <ProjectStatusProvider> */}
            {children}
            {/* Only show React Query devtools in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          {/* </ProjectStatusProvider> */}
        </QueryClientProvider>
      </NextIntlClientProvider>
    </HydrationBoundary>
  );
}

/**
 * Initialize the store on app start
 * This helps with hydration issues in SSR
 */
export function initializeStore() {
  // This function can be called in your root layout
  // to ensure proper hydration of Zustand store
  if (typeof window !== 'undefined') {
    // Any initialization logic for client-side
    console.log('Store initialized on client');
  }
} 