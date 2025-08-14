/**
 * Employee types and interfaces
 */
import type { SearchParams } from './common';

/**
 * Employee entity
 */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  permissionIds: number[];
}

/**
 * Employee list response
 */
export interface EmployeesResponse {
  employees: Employee[];
  totalCount: number;
}

/**
 * Employee query parameters
 */
export type EmployeeQueryParams = SearchParams;

/**
 * Detailed employee information
 */
export interface EmployeeDetails {
  fullName: string;
  email: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  permissions: string[];
  relatedTaskCount: number;
  inProgressTaskCount: number;
  completedTaskCount: number;
  pendingTaskCount: number;
  completionrateTaskCount: number;
} 