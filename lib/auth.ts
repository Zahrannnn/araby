// Role verification utilities
export type UserRole = 'super-admin' | 'Manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user has admin privileges (super-admin or company)
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'super-admin' || user.role === 'Manager';
}

/**
 * Get redirect path based on user role
 */
export function getDefaultRedirectPath(role: UserRole): string {
  switch (role) {
    case 'super-admin':
      return '/super-admin/companies';
    case 'Manager':
      return '/company';
    case 'employee':
      return '/employee/tasks';
    default:
      return '/dashboard';
  }
}