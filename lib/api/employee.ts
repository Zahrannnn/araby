import { apiClient, API_ENDPOINTS } from '@/lib/api';

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

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface EmployeePerformance {
  totalHoursWorked: number;
  averageHoursPerTask: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  overdueCount: number;
  completionRatePercentage: number;
  performanceRatingText: string;
}

export interface EmployeeQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface EmployeesResponse {
  employees: Employee[];
  totalCount: number;
}

export const queryKeys = {
  employees: ['employees'] as const,
  employeeDetails: (id: number) => ['employee', id] as const,
  employeeTasks: (id: number) => ['employee', id, 'tasks'] as const,
  employeePerformance: (id: number) => ['employee', id, 'performance'] as const,
};

export const employeeApi = {
  getEmployees: async (params: EmployeeQueryParams = {}): Promise<EmployeesResponse> => {
    const { data } = await apiClient.get(API_ENDPOINTS.EMPLOYEES, { params });
    return data;
  },

  getEmployeeDetails: async (employeeId: number): Promise<Employee> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}`);
    return data;
  },

  deleteEmployee: async (employeeId: number): Promise<number> => {
    await apiClient.delete(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}`);
    return employeeId;
  },

  updateEmployee: async (employeeId: number, employeeData: Partial<Employee>): Promise<Employee> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}`, employeeData);
    return data;
  },

  getEmployeeTasks: async (employeeId: number): Promise<Task[]> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}/tasks`);
    return data;
  },

  getEmployeePerformance: async (employeeId: number): Promise<EmployeePerformance> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.EMPLOYEES}/${employeeId}/performance`);
    return data;
  },
}; 