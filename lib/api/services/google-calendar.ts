/**
 * Google Calendar API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { ApiErrorResponse } from '../types';

/**
 * Google Calendar API calls
 */
export const googleCalendarApi = {
  /**
   * Get Google Calendar connect URL
   */
  async getConnectUrl(): Promise<{ redirectUrl: string }> {
    try {
      const response = await apiClient.get<{ redirectUrl: string }>(API_ENDPOINTS.GOOGLE_CALENDAR_CONNECT);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to get Google Calendar connect URL');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
}; 