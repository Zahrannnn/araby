// Task and project management type definitions

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  clientId?: string; // If task is client-related
  projectId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  clientId?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  managerId: string; // User ID
  teamMembers: string[]; // User IDs
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'SAR';
  category: string;
  date: Date;
  receipt?: string; // File URL
  taskId?: string;
  projectId?: string;
  createdBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Revenue {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'SAR';
  source: 'invoice' | 'project' | 'other';
  date: Date;
  invoiceId?: string;
  projectId?: string;
  clientId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 