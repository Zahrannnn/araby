/**
 * Axios client configuration with interceptors
 */
import axios, { AxiosError } from 'axios';
import { cookieUtils } from '@/lib/utils/cookies';
import { API_BASE_URL, HTTP_STATUS } from './config';
import type { ApiErrorResponse } from './types';

/**
 * Axios instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and token management
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      
      cookieUtils.clearAll();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 