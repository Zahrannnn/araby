'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CalendarSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

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
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Successfully Connected!
        </h1>
        
        <p className="text-gray-600">
          Your Google Calendar has been successfully connected to your account.
         
        </p>

        <div className="text-sm text-gray-500">
          Redirecting in {countdown} seconds...
        </div>

        <Button 
          onClick={() => router.push('/company/company-settings')}
          variant="outline"
          className="w-full"
        >
          Return to Settings
        </Button>
      </Card>
    </div>
  );
}