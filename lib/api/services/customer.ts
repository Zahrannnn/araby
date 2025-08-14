/**
 * Customer API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  Customer,
  CustomersResponse,
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  TasksResponse,
  OffersResponse,
  ApiErrorResponse 
} from '../types';

/**
 * Customer API calls
 */
export const customerApi = {
  /**
   * Get paginated list of customers
   */
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

  /**
   * Get single customer by ID
   */
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

  /**
   * Create new customer
   */
  async createCustomer(customerData: CreateCustomerPayload): Promise<Customer> {
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

  /**
   * Update existing customer
   */
  async updateCustomer(customerData: UpdateCustomerPayload): Promise<Customer> {
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

  /**
   * Delete customer
   */
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

  /**
   * Get customer tasks
   */
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

  /**
   * Get customer offers
   */
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