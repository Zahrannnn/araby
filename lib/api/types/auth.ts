/**
 * Authentication types and interfaces
 */
import type { User } from '@/types/user';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  token: string;
  expireAt: string;
  role: 'SuperAdmin' | 'Manager' | 'Employee';
  permissions: string[];
}

/**
 * Extended login response with parsed user data
 */
export interface ParsedLoginResponse extends LoginResponse {
  user: User;
} 