// API configuration and utilities
import axios, { AxiosError } from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { cookieUtils } from '@/lib/utils/cookies';
import { parseUserFromToken } from '@/lib/utils/jwt';
import { User } from '@/types/user';

/**
 * Base API configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crmproject.runasp.net/api';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/Auth/login',
  LOGOUT: '/Auth/logout',
  REFRESH: '/Auth/refresh',
  
  // User management
  USERS: '/users',
  
  // Company management
  COMPANIES: '/companies',
  CLIENTS: '/clients',
  EMPLOYEES: '/employees',
  
  // Business operations
  TASKS: '/tasks',
  QUOTES: '/quotes',
  INVOICES: '/invoices',
  EXPENSES: '/expenses',
  REVENUES: '/revenues',
  
  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  
  // Super Admin endpoints
  SUPER_ADMIN_NOTIFICATIONS: '/SuperAdmin/notifications',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Authentication types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expireAt: string;
  role: 'SuperAdmin' | 'Manager' | 'Employee';
  permissions: string[];
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Company details response from API
 */
export interface CompanyDetailsResponse {
  companyInfo: {
    id: number;
    companyName: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    vatNumber: string;
    subsType: string;
    subscriptionTypeId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    subscriptionEndDate: string;
    notes: string | null;
  };
  managerInfo: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    createdAt: string;
    isActive: boolean;
  };
  metrics: {
    subscriptionDate: string;
    customerCount: number;
    employeeCount: number;
    totalProfit: number;
    paidInvoiceCount: number;
  };
}

/**
 * Extended login response with parsed user data
 */
export interface ParsedLoginResponse extends LoginResponse {
  user: User;
}

/**
 * Axios instance with interceptors
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for external API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear cookies and redirect to login
      cookieUtils.clearAll();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authApi = {
  async login(credentials: LoginRequest, rememberMe: boolean = false): Promise<ParsedLoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.data.token) {
        // Parse user information from JWT token
        const userFromToken = parseUserFromToken(response.data.token);
        
        if (!userFromToken) {
          throw new Error('Invalid token format');
        }

        // Store token and user data in cookies
        cookieUtils.setToken(response.data.token, rememberMe);
        cookieUtils.setUserData(userFromToken, rememberMe);
        cookieUtils.setRememberMe(rememberMe);

        // Return parsed response with user data
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

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear all cookies
      cookieUtils.clearAll();
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

/**
 * Super Admin API calls
 */
export const superAdminApi = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.SUPER_ADMIN_NOTIFICATIONS);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch notifications');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await apiClient.put(`/SuperAdmin/markAsRead?notificationId=${notificationId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to mark notification as read');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await apiClient.put('/SuperAdmin/markAllAsRead');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to mark all notifications as read');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getCompanyDetails(companyId: number): Promise<CompanyDetailsResponse> {
    try {
      const response = await apiClient.get<CompanyDetailsResponse>(`/SuperAdmin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch company details');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};

/**
 * TanStack Query configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: Error) => {
        // Don't retry on 404 or auth errors
        if (error && 'response' in error && typeof error.response === 'object' && error.response) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Query keys factory
 */
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  companies: ['companies'] as const,
  company: (id: string) => ['companies', id] as const,
  companyDetails: (id: number) => ['companies', 'details', id] as const,
  clients: (companyId: string) => ['clients', companyId] as const,
  client: (id: string) => ['clients', 'detail', id] as const,
  employees: (companyId: string) => ['employees', companyId] as const,
  tasks: (filters?: Record<string, unknown>) => ['tasks', filters] as const,
  task: (id: string) => ['tasks', id] as const,
  quotes: (companyId: string) => ['quotes', companyId] as const,
  quote: (id: string) => ['quotes', id] as const,
  invoices: (companyId: string) => ['invoices', companyId] as const,
  invoice: (id: string) => ['invoices', id] as const,
  expenses: (companyId: string) => ['expenses', companyId] as const,
  revenues: (companyId: string) => ['revenues', companyId] as const,
  subscriptions: ['subscriptions'] as const,
  notifications: ['notifications'] as const,
} as const; 

/**
 * Notification interface based on API response
 */
export interface Notification {
  notificationId: number;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
} 