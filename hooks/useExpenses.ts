import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api';

export interface ExpensesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  from?: string;
  to?: string;
}

export function useExpensesCategoryChart() {
  return useQuery({
    queryKey: ['expenses', 'category-chart'],
    queryFn: expensesApi.getCategoryChart,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpensesMonthlyChart() {
  return useQuery({
    queryKey: ['expenses', 'monthly-chart'],
    queryFn: expensesApi.getMonthlyChart,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpenses(params?: ExpensesQueryParams) {
  const finalParams = { page: 1, pageSize: 10, ...params };
  return useQuery({
    queryKey: ['expenses', finalParams],
    queryFn: () => expensesApi.getExpenses(finalParams),
    staleTime: 2 * 60 * 1000,
  });
} 