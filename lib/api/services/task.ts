/**
 * Task API service
 */
import axios from 'axios';
import { apiClient } from '../client';
import { API_BASE_URL } from '../config';
import type { 
  TaskDetails,
  CreateTaskPayload,
  ApiErrorResponse 
} from '../types';

/**
 * Task API calls
 */
export const tasksApi = {
  /**
   * Get task details by ID
   */
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

  /**
   * Start a task
   */
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

  /**
   * Complete a task with optional result files
   */
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

  /**
   * Create a new task
   */
  async createTask(payload: CreateTaskPayload): Promise<unknown> {
    try {
      // Validate required fields
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

      formData.append('AssignedToUserId', payload.AssignedToUserId.toString());
      formData.append('CustomerId', payload.CustomerId.toString());
      formData.append('TaskTitle', payload.TaskTitle.trim());
      formData.append('Description', payload.Description.trim());
      formData.append('Priority', payload.Priority.trim());
      formData.append('DueDate', new Date(payload.DueDate).toISOString());
      formData.append('Notes', payload.Notes.trim());

      payload.requirementFiles.forEach(file => {
        formData.append('requirementFiles', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

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