/**
 * Authentication API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { cookieUtils } from '@/lib/utils/cookies';
import { parseUserFromToken } from '@/lib/utils/jwt';
import type { User } from '@/types/user';
import type { 
  LoginRequest, 
  LoginResponse, 
  ParsedLoginResponse 
} from '../types';

/**
 * Authentication API calls
 */
export const authApi = {
  /**
   * User login
   */
  async login(credentials: LoginRequest, rememberMe: boolean = false): Promise<ParsedLoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.data.token) {
        
        const userFromToken = parseUserFromToken(response.data.token);
        
        if (!userFromToken) {
          throw new Error('Invalid token format');
        }

        
        cookieUtils.setToken(response.data.token, rememberMe);
        cookieUtils.setUserData(userFromToken, rememberMe);
        cookieUtils.setRememberMe(rememberMe);

  
        if (typeof window !== 'undefined' && response.data.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
        }

        return {
          ...response.data,
          user: userFromToken as User,
        };
      }
      
      throw new Error('No token received from server');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        
        // Try different possible error message properties
        const backendMessage = errorData.message || errorData.error || errorData;
        
        // If the backend message is a string, use it directly
        if (typeof backendMessage === 'string') {
          throw new Error(backendMessage);
        }
        
        // If it's an object, try to extract the message
        if (typeof backendMessage === 'object' && backendMessage !== null) {
          const errorObj = backendMessage as Record<string, unknown>;
          const message = errorObj.message || errorObj.error;
          if (typeof message === 'string') {
            throw new Error(message);
          }
        }
      }
      
      // For network errors or other non-API errors
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      cookieUtils.clearAll();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userPermissions');
      }
    }
  },

  /**
   * Get current user from cookies
   */
  getCurrentUser(): User | null {
    const userData = cookieUtils.getUserData();
    return userData as User | null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = cookieUtils.getToken();
    return !!token;
  }
}; 