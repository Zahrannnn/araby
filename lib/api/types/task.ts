/**
 * Task types and interfaces
 */
import type { PaginatedResponse } from './common';

/**
 * Basic task entity
 */
export interface Task {
  taskItemId: number;
  taskTitle: string;
  taskStatus: string;
  priority: string;
  dueDate: string;
  customerName: string;
  createdAt: string;
  assignedToUserId?: number;
  customerId?: number;
}

/**
 * Task list response
 */
export interface TasksResponse extends PaginatedResponse<Task> {}

/**
 * Task file attachment
 */
export interface TaskFile {
  fileName: string;
  fileUrl: string;
  fileType: 'Requirement' | 'Result';
}

/**
 * Detailed task entity
 */
export interface TaskDetails {
  taskItemId: number;
  taskTitle: string;
  description: string;
  taskStatus: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  startedAt: string | null;
  createdAt: string;
  completedDate: string | null;
  timeSpentInHours: number | null;
  notes: string;
  assignedToName: string;
  isInProgress: boolean;
  isItForAssignedEmployee: boolean;
  requirementFiles: TaskFile[];
  resultFiles: TaskFile[];
  customerName: string;
}

/**
 * Create task payload
 */
export interface CreateTaskPayload {
  AssignedToUserId: number;
  CustomerId?: number;
  TaskTitle: string;
  Description: string;
  Priority: string;
  DueDate: string | Date;
  Notes: string;
  requirementFiles: File[];
} 