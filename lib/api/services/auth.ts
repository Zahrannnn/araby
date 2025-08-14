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
  ParsedLoginResponse,
  ApiErrorResponse 
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
        // Parse user data from token
        const userFromToken = parseUserFromToken(response.data.token);
        
        if (!userFromToken) {
          throw new Error('Invalid token format');
        }

        // Store authentication data
        cookieUtils.setToken(response.data.token, rememberMe);
        cookieUtils.setUserData(userFromToken, rememberMe);
        cookieUtils.setRememberMe(rememberMe);

        // Store permissions in localStorage
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
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Login failed');
      }
      throw new Error('Network error. Please check your connection.');
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