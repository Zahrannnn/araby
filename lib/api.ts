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
  CUSTOMERS: '/customer',
  EMPLOYEES: '/Employees',
  
  // Business operations
  TASKS: '/tasks',
  QUOTES: '/quotes',
  INVOICES: '/invoices',
  EXPENSES: '/expenses',
  EXPENSES_CATEGORY_CHART: '/Expenses/category-chart',
  EXPENSES_MONTHLY_CHART: '/Expenses/monthly-chart',
  REVENUES: '/revenues',
  
  // Dashboard
  COMPANY_DASHBOARD: '/CompanyDashboard',
  
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

        // Store permissions in localStorage
        if (typeof window !== 'undefined' && response.data.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
        }

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
      // Clear all cookies and localStorage
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
 * Customer types
 */
export interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  createdAt: string;
  notes: string;
  offerCount: number;
  taskCount: number;
  totalProfit: number;
}

export interface CustomersResponse {
  customers: Customer[];
  totalCount: number;
}

export interface CustomerQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Task types
 */
export interface Task {
  taskItemId: number;
  taskTitle: string;
  taskStatus: string;
  priority: string;
  dueDate: string;
  customerName: string;
  createdAt: string;
  assignedToUserId?: number;
  customerId?: number;
}

export interface TasksResponse {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  items: Task[];
}

/**
 * Detailed task types
 */
export interface TaskFile {
  fileName: string;
  fileUrl: string;
  fileType: 'Requirement' | 'Result';
}

export interface TaskDetails {
  taskItemId: number;
  taskTitle: string;
  description: string;
  taskStatus: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  startedAt: string | null;
  createdAt: string;
  completedDate: string | null;
  timeSpentInHours: number | null;
  notes: string;
  assignedToName: string;
  isInProgress: boolean;
  isItForAssignedEmployee: boolean;
  requirementFiles: TaskFile[];
  resultFiles: TaskFile[];
}

/**
 * Offer types
 */
export interface Offer {
  offerId: number;
  offerNumber: string;
  issueDate: string;
  serviceTypeOverall: string;
  totalAmount: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Sent';
}

export interface OffersResponse {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  items: Offer[];
}

/**
 * Detailed offer types
 */
export interface OfferLocation {
  locationType: 'Origin' | 'Destination';
  addressIndex: number;
  street: string;
  zipCode: string;
  city: string;
  countryCode: string;
  buildingType: string;
  floor: string;
  hasLift: boolean;
}

export interface AdditionalCost {
  description: string;
  amount: number;
}

export interface ServiceDetails {
  // Move service details
  moveDate?: string;
  moveInDate?: string | null;
  moveStartTime?: string;
  roundTripCostCHF?: number;
  selectedTariffDescription?: string;
  numberOfStaff?: number;
  numberOfDeliveryTrucks?: number;
  hourlyRateCHF?: number;
  durationHours?: number;
  disassemblyAssemblyBy?: string;
  
  // Cleaning service details
  cleaningType?: string;
  fixedPriceRateCHF?: number;
  hourlyRateCHFPerHour?: number | null;
  fillNailHoles?: boolean;
  withHighPressureCleaner?: boolean;
  cleaningDate?: string;
  cleaningStartTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  discount?: number;
  additionalCosts?: AdditionalCost[];
  
  // Packing service details
  packingDate?: string;
  packingStartTime?: string;
  packingMaterialsCost?: number;
  
  // Unpacking service details
  unpackingDate?: string;
  unpackingStartTime?: string;
  
  // Disposal service details
  disposalDate?: string;
  disposalStartTime?: string;
  volumeRateCHFPerM3?: number;
  flatRateDisposalCostCHF?: number;
  estimatedVolumeM3?: number;
  selectedEmployeePlanTariffDescription?: string | null;
  additionalCostsText?: string;
  furtherDiscounts?: string;
  
  // Storage service details
  rateCHFPerM3PerMonth?: number;
  volumeM3?: number;
  cost?: number;
  
  // Transport service details
  transportDate?: string;
  transportStartTime?: string;
  transportTypeText?: string;
  fixedRateCHF?: number;
  selectedHourlyTariffDescription?: string | null;
  concessionText?: string;
}

export interface ServiceLineItem {
  serviceType: string;
  totalLinePrice: number;
  serviceDetails: ServiceDetails;
}

export interface PackingMaterial {
  description: string;
  rentOrBuy: 'Rent' | 'Buy';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OfferDetails {
  offerId: number;
  offerNumber: string;
  customerId: number;
  customerName: string;
  issueDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Sent';
  totalAmount: number;
  discountAmount: number;
  pdfUrl: string;
  googleCalendarEventId: string;
  notesInOffer: string;
  notesNotInOffer: string;
  locations: OfferLocation[];
  serviceLineItems: ServiceLineItem[];
  packingMaterials: PackingMaterial[];
}

/**
 * Customer API calls
 */
export const customerApi = {
  async getCustomers(params: CustomerQueryParams = {}): Promise<CustomersResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.pageIndex !== undefined) {
        searchParams.append('pageIndex', params.pageIndex.toString());
      }
      if (params.pageSize !== undefined) {
        searchParams.append('pageSize', params.pageSize.toString());
      }
      if (params.search && params.search.trim()) {
        searchParams.append('search', params.search.trim());
      }

      const response = await apiClient.get<CustomersResponse>(
        `${API_ENDPOINTS.CUSTOMERS}?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch customers');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getCustomer(customerId: number): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch customer');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async createCustomer(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    notes: string;
  }): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>(API_ENDPOINTS.CUSTOMERS, customerData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to create customer');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async deleteCustomer(customerId: number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to delete customer');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async updateCustomer(customerData: {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    notes: string;
  }): Promise<Customer> {
    try {
      const response = await apiClient.put<Customer>(API_ENDPOINTS.CUSTOMERS, customerData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to update customer');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getCustomerTasks(customerId: number, pageIndex: number = 1, pageSize: number = 3): Promise<TasksResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('pageIndex', pageIndex.toString());
      searchParams.append('pageSize', pageSize.toString());

      const response = await apiClient.get<TasksResponse>(
        `${API_ENDPOINTS.CUSTOMERS}/${customerId}/tasks?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch customer tasks');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getCustomerOffers(customerId: number, pageIndex: number = 1, pageSize: number = 10): Promise<OffersResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('pageIndex', pageIndex.toString());
      searchParams.append('pageSize', pageSize.toString());

      const response = await apiClient.get<OffersResponse>(
        `${API_ENDPOINTS.CUSTOMERS}/${customerId}/offers?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch customer offers');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};

/**
 * Offers API calls
 */
export const offersApi = {
  async getOfferDetails(offerId: number): Promise<OfferDetails> {
    try {
      const response = await apiClient.get<OfferDetails>(`/offers/${offerId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch offer details');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};

/**
 * Tasks API calls
 */
export const tasksApi = {
  async getTaskDetails(taskId: number): Promise<TaskDetails> {
    try {
      const response = await apiClient.get<TaskDetails>(`/Task/${taskId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch task details');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async startTask(taskId: number): Promise<void> {
    try {
      await apiClient.post(`/Task/${taskId}/start`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to start task');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async completeTask(taskId: number, resultFiles?: File[]): Promise<void> {
    try {
      const formData = new FormData();
      
      if (resultFiles) {
        resultFiles.forEach(file => {
          formData.append('resultFiles', file);
        });
      }

      await apiClient.post(`/Task/${taskId}/complete`, formData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to complete task');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
  async createTask(payload: {
    AssignedToUserId: number;
    CustomerId?: number; // Made optional to match C# DTO
    TaskTitle: string;
    Description: string;
    Priority: string;
    DueDate: string | Date; // Allow both string and Date
    Notes: string;
    requirementFiles: File[];
  }): Promise<unknown> {
    try {
      // Validate required fields before creating FormData
      if (!payload.TaskTitle?.trim()) {
        throw new Error('Task title is required');
      }
      if (!payload.Description?.trim()) {
        throw new Error('Description is required');
      }
      if (!payload.Priority?.trim()) {
        throw new Error('Priority is required');
      }
      if (!payload.Notes?.trim()) {
        throw new Error('Notes is required');
      }
      if (!payload.requirementFiles?.length) {
        throw new Error('At least one requirement file is required');
      }
      if (!payload.AssignedToUserId) {
        throw new Error('AssignedToUserId is required');
      }
      if (!payload.CustomerId) {
        throw new Error('CustomerId is required');
      }
      if (!payload.DueDate) {
        throw new Error('DueDate is required');
      }

      const formData = new FormData();

      // Add all task data fields directly to FormData
      formData.append('AssignedToUserId', payload.AssignedToUserId.toString());
      formData.append('CustomerId', payload.CustomerId.toString());
      formData.append('TaskTitle', payload.TaskTitle.trim());
      formData.append('Description', payload.Description.trim());
      formData.append('Priority', payload.Priority.trim());
      formData.append('DueDate', new Date(payload.DueDate).toISOString());
      formData.append('Notes', payload.Notes.trim());

      // Add files
      payload.requirementFiles.forEach(file => {
        formData.append('requirementFiles', file);
      });

      // Set proper headers for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Debug log
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('FormData being sent:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await apiClient.post('/Task/AddTask', formData, config);

      return response.data;
    } catch (error) {
      console.error('Full error object:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });

        if (error.response?.data) {
          const errorData = error.response.data as { errors?: Record<string, string[]>; message?: string; error?: string; };
          if (errorData.errors && typeof errorData.errors === 'object') {
            const messages = Object.values(errorData.errors)
              .flat()
              .join(' ');
            throw new Error(messages || 'Failed to create task');
          }
          throw new Error(errorData.message || errorData.error || 'Failed to create task');
        }
      }
      
      throw new Error(`Network error (${API_BASE_URL}). Please check your connection and try again.`);
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
  customers: (params?: CustomerQueryParams) => ['customers', params] as const,
  customer: (id: number) => ['customers', 'detail', id] as const,
  customerTasks: (id: number, params?: { pageIndex: number; pageSize: number }) => 
    ['customers', 'tasks', id, params] as const,
  customerOffers: (id: number, params?: { pageIndex: number; pageSize: number }) => 
    ['customers', 'offers', id, params] as const,
  employees: (companyId: string) => ['employees', companyId] as const,
  employeeDetails: (id: number) => ['employees', 'details', id] as const,
  employeeTasks: (id: number) => ['employees', 'tasks', id] as const,
  offerDetails: (id: number) => ['offers', 'details', id] as const,
  tasks: (filters?: Record<string, unknown>) => ['tasks', filters] as const,
  task: (id: string) => ['tasks', id] as const,
  taskDetails: (id: number) => ['tasks', 'details', id] as const,
  quotes: (companyId: string) => ['quotes', companyId] as const,
  quote: (id: string) => ['quotes', id] as const,
  invoices: (companyId: string) => ['invoices', companyId] as const,
  invoice: (id: string) => ['invoices', id] as const,
  expenses: (companyId: string) => ['expenses', companyId] as const,
  revenues: (companyId: string) => ['revenues', companyId] as const,
  subscriptions: ['subscriptions'] as const,
  notifications: ['notifications'] as const,
  dashboard: ['dashboard'] as const,
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

/**
 * Dashboard data interface
 */
export interface DashboardData {
  topCards: {
    currentMonthIncome: number;
    currentMonthProfit: number;
    profitChangeFromLastMonth: number;
    totalIncome: number;
    totalExpenses: number;
    totalProfit: number;
    totalOffers: number;
    pendingOffers: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
  };
  monthlyFinanceChart: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  offerStatusChart: {
    accepted: number;
    pending: number;
    rejected: number;
  };
  revenueByService: Array<{
    serviceType: string;
    revenue: number;
  }>;
  importantTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
}

/**
 * Dashboard API calls
 */
export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>(API_ENDPOINTS.COMPANY_DASHBOARD);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch dashboard data');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
}; 

/**
 * Employee types
 */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  permissionIds: number[];
}

export interface EmployeesResponse {
  employees: Employee[];
  totalCount: number;
}

export interface EmployeeQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

// Employee details type for api/Employees/id
export interface EmployeeDetails {
  fullName: string;
  email: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  permissions: string[];
  relatedTaskCount: number;
  inProgressTaskCount: number;
  completedTaskCount: number;
  pendingTaskCount: number;
  completionrateTaskCount: number;
}

/**
 * Employee API calls
 */
export const employeeApi = {
  async getEmployees(params: EmployeeQueryParams = {}): Promise<EmployeesResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.pageIndex !== undefined) {
        searchParams.append('pageIndex', params.pageIndex.toString());
      }
      if (params.pageSize !== undefined) {
        searchParams.append('pageSize', params.pageSize.toString());
      }
      if (params.search && params.search.trim()) {
        searchParams.append('search', params.search.trim());
      }

      const response = await apiClient.get<EmployeesResponse>(
        `${API_ENDPOINTS.EMPLOYEES}?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch employees');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getEmployeeDetails(employeeId: number): Promise<EmployeeDetails> {
    try {
      const response = await apiClient.get<EmployeeDetails>(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch employee details');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getEmployeeTasks(employeeId: number): Promise<TasksResponse> {
    try {
      const response = await apiClient.get<TasksResponse>(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}/tasks`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch employee tasks');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
}; 

/**
 * Expenses API calls
 */
export interface AddExpensePayload {
  description: string;
  amountCHF: number;
  expenseDate: string;
  category: string;
}

export interface UpdateExpensePayload {
  expenseId: number;
  description: string;
  amountCHF: number;
  expenseDate: string;
  category: string;
}

export const expensesApi = {
  async getCategoryChart() {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES_CATEGORY_CHART);
    return data;
  },
  async getMonthlyChart() {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES_MONTHLY_CHART);
    return data;
  },
  async getExpenses(params = { page: 1, pageSize: 10 }) {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES, { params });
    return data;
  },
  async addExpense(payload: AddExpensePayload) {
    const { data } = await apiClient.post(API_ENDPOINTS.EXPENSES, payload);
    return data;
  },
  async updateExpense(payload: UpdateExpensePayload) {
    const { expenseId, ...rest } = payload;
    const { data } = await apiClient.put(`${API_ENDPOINTS.EXPENSES}/${expenseId}`, rest);
    return data;
  },
  async deleteExpense(expenseId: number) {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.EXPENSES}/${expenseId}`);
    return data;
  },
}; 

export const companyApi = {
  async getCurrentCompanySettings(): Promise<CompanyDetailsResponse> {
    try {
      const response = await apiClient.get<CompanyDetailsResponse>(
        '/CompanySettings/GetCompany'
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch company settings');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
  async getStripeKeys(): Promise<{ publishableKey: string; secretKey: string } | null> {
    try {
      const response = await apiClient.get<{ publishableKey: string; secretKey: string }>(
        '/CompanySettings/stripe-keys'
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch Stripe keys');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
  async setStripeKeys(keys: { publishableKey: string; secretKey: string }): Promise<void> {
    try {
      await apiClient.post('/CompanySettings/stripe-keys', keys);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to save Stripe keys');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};