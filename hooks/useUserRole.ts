'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/auth';
import { cookieUtils } from '@/lib/utils/cookies';


export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 
    
    const fetchUser = async () => {
      try {
        const userData = cookieUtils.getUserData();
        if (userData) {
          setUser(userData as User);
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
    return user?.role === 'super-admin' || user?.role === 'Manager';
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
    setUser, 
  };
}