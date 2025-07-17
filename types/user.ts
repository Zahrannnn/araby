// User-related type definitions

export type UserRole = 'super-admin' | 'Manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  logo?: string;
  isActive: boolean;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  position: string;
  department?: string;
  salary?: number;
  hireDate: Date;
  user: User;
  company: Company;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  companyId: string;
  planType: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  startDate: Date;
  endDate: Date;
  price: number;
  features: string[];
}