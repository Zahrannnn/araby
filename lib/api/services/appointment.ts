/**
 * Appointment API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  Appointment,
  CreateAppointmentPayload,
  ApiErrorResponse 
} from '../types';

/**
 * Appointment API calls
 */
export const appointmentsApi = {
  /**
   * Create new appointment
   */
  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS, payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to create appointment');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
}; 