/**
 * Offer API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import type { 
  OfferDetails,
  ApiErrorResponse 
} from '../types';

/**
 * Offer API calls
 */
export const offersApi = {
  /**
   * Get detailed offer information by ID
   */
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