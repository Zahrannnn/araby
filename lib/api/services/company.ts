/**
 * Company API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import type { 
  CompanyDetailsResponse,
  ApiErrorResponse 
} from '../types';

/**
 * Company API calls
 */
export const companyApi = {
  /**
   * Get current company settings
   */
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

  /**
   * Get Stripe keys
   */
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

  /**
   * Set Stripe keys
   */
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

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(logoFile: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('logoFile', logoFile);
      
      await apiClient.post('/CompanySettings/saveupdate-company-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to upload company logo');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
}; 