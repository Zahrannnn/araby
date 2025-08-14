/**
 * Customer types and interfaces
 */
import type { SearchParams } from './common';

/**
 * Customer entity
 */
export interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  fullAddress: string;
  zipCode: string;
  country: string;
  createdAt: string;
  notes: string;
  offerCount: number;
  taskCount: number;
  totalProfit: number;
}

/**
 * Customer list response
 */
export interface CustomersResponse {
  customers: Customer[];
  totalCount: number;
}

/**
 * Customer query parameters
 */
export type CustomerQueryParams = SearchParams;

/**
 * Create customer payload
 */
export interface CreateCustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  notes: string;
}

/**
 * Update customer payload
 */
export interface UpdateCustomerPayload extends CreateCustomerPayload {
  customerId: number;
} 