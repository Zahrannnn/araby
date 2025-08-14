/**
 * Expense API service
 */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { 
  AddExpensePayload,
  UpdateExpensePayload 
} from '../types';

/**
 * Expense API calls
 */
export const expensesApi = {
  /**
   * Get category chart data
   */
  async getCategoryChart() {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES_CATEGORY_CHART);
    return data;
  },

  /**
   * Get monthly chart data
   */
  async getMonthlyChart() {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES_MONTHLY_CHART);
    return data;
  },

  /**
   * Get expenses list
   */
  async getExpenses(params = { page: 1, pageSize: 10 }) {
    const { data } = await apiClient.get(API_ENDPOINTS.EXPENSES, { params });
    return data;
  },

  /**
   * Add new expense
   */
  async addExpense(payload: AddExpensePayload) {
    const { data } = await apiClient.post(API_ENDPOINTS.EXPENSES, payload);
    return data;
  },

  /**
   * Update existing expense
   */
  async updateExpense(payload: UpdateExpensePayload) {
    const { expenseId, ...rest } = payload;
    const { data } = await apiClient.put(`${API_ENDPOINTS.EXPENSES}/${expenseId}`, rest);
    return data;
  },

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: number) {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.EXPENSES}/${expenseId}`);
    return data;
  },
}; 