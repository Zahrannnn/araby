/**
 * React Query keys factory
 * Centralized query key management for consistent caching
 */
import type { CustomerQueryParams, EmployeeQueryParams } from '../types';

/**
 * Query keys factory for consistent cache key generation
 */
export const queryKeys = {
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  

  companies: ['companies'] as const,
  company: (id: string) => ['companies', id] as const,
  companyDetails: (id: number) => ['companies', 'details', id] as const,
  

  clients: (companyId: string) => ['clients', companyId] as const,
  client: (id: string) => ['clients', 'detail', id] as const,
  

  customers: (params?: CustomerQueryParams) => ['customers', params] as const,
  customer: (id: number) => ['customers', 'detail', id] as const,
  customerTasks: (id: number, params?: { pageIndex: number; pageSize: number }) => 
    ['customers', 'tasks', id, params] as const,
  customerOffers: (id: number, params?: { pageIndex: number; pageSize: number }) => 
    ['customers', 'offers', id, params] as const,
  

  employees: (companyId: string) => ['employees', companyId] as const,
  employeeDetails: (id: number) => ['employees', 'details', id] as const,
  employeeTasks: (id: number) => ['employees', 'tasks', id] as const,
  

  offerDetails: (id: number) => ['offers', 'details', id] as const,
  

  tasks: (filters?: Record<string, unknown>) => ['tasks', filters] as const,
  task: (id: string) => ['tasks', id] as const,
  taskDetails: (id: number) => ['tasks', 'details', id] as const,
  

  quotes: (companyId: string) => ['quotes', companyId] as const,
  quote: (id: string) => ['quotes', id] as const,
  

  invoices: (companyId: string) => ['invoices', companyId] as const,
  invoice: (id: string) => ['invoices', id] as const,
  
  
  expenses: (companyId: string) => ['expenses', companyId] as const,
  

  revenues: (companyId: string) => ['revenues', companyId] as const,
  

  appointments: ['appointments'] as const,
  

  subscriptions: ['subscriptions'] as const,
  
 
  notifications: ['notifications'] as const,
  

  dashboard: ['dashboard'] as const,
} as const; 