/**
 * Super Admin API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  Notification,
  CompanyDetailsResponse,
  ApiErrorResponse 
} from '../types';

/**
 * Super Admin API calls
 */
export const superAdminApi = {
  /**
   * Get notifications for super admin
   */
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

  /**
   * Mark notification as read
   */
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

  /**
   * Mark all notifications as read
   */
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

  /**
   * Get company details for super admin
   */
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