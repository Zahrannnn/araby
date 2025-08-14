/**
 * Dashboard API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  DashboardData,
  ApiErrorResponse 
} from '../types';

/**
 * Dashboard API calls
 */
export const dashboardApi = {
  /**
   * Get dashboard data
   */
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