'use client';

import { Navbar } from '@/components/ui/navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale: string;
  userRole?: 'super-admin' | 'company' | 'employee';
  userName?: string;
  companyName?: string;
}

export function DashboardLayout({ 
  children, 
  locale, 
  userRole = 'company',
  userName = 'John Doe',
  companyName = 'Nedx CRM'
}: DashboardLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        locale={locale}
        userRole={userRole}
        userName={userName}
        companyName={companyName}
      />
      <main>
        {children}
      </main>
    </div>
  );
} 