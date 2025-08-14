/**
 * Employee API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  Employee,
  EmployeesResponse,
  EmployeeQueryParams,
  EmployeeDetails,
  TasksResponse,
  ApiErrorResponse 
} from '../types';

/**
 * Employee API calls
 */
export const employeeApi = {
  /**
   * Get paginated list of employees
   */
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

  /**
   * Get employee details by ID
   */
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

  /**
   * Get tasks assigned to employee
   */
  async getEmployeeTasks(employeeId: number): Promise<TasksResponse> {
    try {
      const response = await apiClient.get<TasksResponse>(`Task/assigned-to-me`);
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