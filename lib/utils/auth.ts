import { cookieUtils } from './cookies';
import { parseUserFromToken, isTokenExpired } from './jwt';
import { User } from '@/types/user';

/**
 * Simple authentication utilities without state management
 */
export const authUtils = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = cookieUtils.getToken();
    if (!token) return false;
    
    // Check if token is expired
    return !isTokenExpired(token);
  },

  /**
   * Get current user from token
   */
  getCurrentUser(): User | null {
    const token = cookieUtils.getToken();
    if (!token || isTokenExpired(token)) {
      return null;
    }

    // Try to get user from cookies first
    const userData = cookieUtils.getUserData();
    if (userData) {
      return userData as User;
    }

    // Fallback to parsing from token
    const userFromToken = parseUserFromToken(token);
    return userFromToken as User | null;
  },

  /**
   * Get current user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  /**
   * Check if user is admin (SuperAdmin or CompanyManager)
   */
  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'super-admin' || role === 'company';
  },

  /**
   * Logout user by clearing cookies
   */
  logout(): void {
    cookieUtils.clearAll();
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}; 