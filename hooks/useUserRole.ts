'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/auth';

/**
 * Custom hook for managing user role and permissions
 */
export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual user fetching from your auth provider
    // This could be from NextAuth, Supabase, Firebase, etc.
    
    const fetchUser = async () => {
      try {
        // Placeholder - replace with actual auth logic
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const hasRole = (requiredRole: UserRole): boolean => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'super-admin' || user?.role === 'company';
  };

  const canAccessCompany = (companyId: string): boolean => {
    if (!user) return false;
    if (user.role === 'super-admin') return true;
    return user.companyId === companyId;
  };

  return {
    user,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    canAccessCompany,
    setUser, // For login/logout
  };
} 