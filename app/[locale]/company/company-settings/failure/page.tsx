'use client';

import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CalendarFailurePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/company/company-settings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Connection Failed
        </h1>
        
        <p className="text-gray-600">
          We could not connect your Google Calendar to your account. This might be due to:
        </p>

        <ul className="text-sm text-gray-600 text-left list-disc pl-6 space-y-2">
          <li>Invalid or expired authorization</li>
          <li>Insufficient permissions</li>
          <li>Network connectivity issues</li>
        </ul>

        <div className="text-sm text-gray-500">
          Redirecting in {countdown} seconds...
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/company/company-settings')}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Try Again
          </Button>

          <Button 
            onClick={() => router.push('/company/company-settings')}
            variant="outline"
            className="w-full"
          >
            Return to Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}