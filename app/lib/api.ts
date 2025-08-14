import axios from 'axios'

export interface ApiErrorResponse {
  message?: string
  error?: string
}

export interface Offer {
  offerId: number
  offerNumber: string
  clientName: string
  issueDate: string
  status: string
  totalAmount: number
  numberOfServices: number
}

export interface OffersResponse {
  pageIndex: number
  totalPages: number
  totalCount: number
  items: Offer[]
}

// API endpoints
export const API_ENDPOINTS = {
  OFFERS: '/api/Offers',
} as const;

export const apiClient = axios.create({
  baseURL: 'https://nedx.premiumasp.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const token = getCookie('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
);

/**
 * Offers API client
 */
export const offersApi = {
  async getOffers(params: { pageIndex?: number; pageSize?: number; searchWord?: string; status?: string } = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.pageIndex !== undefined) {
        searchParams.append('pageIndex', params.pageIndex.toString());
      }
      if (params.pageSize !== undefined) {
        searchParams.append('pageSize', params.pageSize.toString());
      }
      if (params.searchWord && params.searchWord.trim()) {
        searchParams.append('searchWord', params.searchWord.trim());
      }
      if (params.status && params.status.trim()) {
        searchParams.append('status', params.status.trim());
      }

      const response = await apiClient.get<OffersResponse>(
        `${API_ENDPOINTS.OFFERS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        const errorData = error.response?.data as ApiErrorResponse;
        throw new Error(errorData?.message || errorData?.error || 'Failed to fetch offers');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
};

/**
 * Get offer details by ID
 */
export async function getOfferDetails(offerId: number) {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.OFFERS}/${offerId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiErrorResponse;
      throw new Error(errorData?.message || errorData?.error || 'Failed to fetch offer details');
    }
    throw new Error('Network error. Please check your connection.');
  }
} 