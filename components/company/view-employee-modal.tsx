"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEmployeeDetails, useEmployeeTasks, useEmployeePerformance } from '@/hooks/useEmployees'
import type { Employee } from '@/lib/api'

interface TaskItem {
  taskItemId: number;
  taskTitle: string;
  taskStatus: string;
  priority: string;
  dueDate: string;
  customerName: string;
  createdAt: string;
}

interface TasksResponse {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  items: TaskItem[];
}

interface EmployeeDetails extends Employee {
  relatedTaskCount: number;
  permissions: string[];
}

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  employee: Employee | null;
}

export function ViewEmployeeModal({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  employee 
}: ViewEmployeeModalProps) {
  const t = useTranslations('company.employees.viewModal');
  
  // Fetch detailed employee data from API
  const { data: employeeDetails, isLoading, error } = useEmployeeDetails(employee?.id || null);
  
  // Fetch employee tasks
  const { 
    data: tasksData, 
    isLoading: isTasksLoading, 
    error: tasksError 
  } = useEmployeeTasks(employee?.id || null) as { 
    data: TasksResponse | undefined; 
    isLoading: boolean; 
    error: unknown; 
  };

  // Fetch employee performance data
  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    error: performanceError
  } = useEmployeePerformance(employee?.id || null);

  if (!isOpen) return null;

  // Error handling helper
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return t('errorUnknown');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('loading') || 'Laden...'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-red-500 mb-3">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('errorTitle')}</h3>
            <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onClose} variant="outline">
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employeeDetails || !employee) return null;

  const handleEdit = () => {
    if (onEdit && employee) {
      onEdit(employee);
    }
  };

  const handleDelete = () => {
    if (onDelete && employee) {
      onDelete(employee);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('active')}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t('inactive')}
        </span>
      )
    }
  };

  // Status and priority colors for tasks table
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Tasks Table Content
  const renderTasksTable = () => {
    if (isTasksLoading) {
      return (
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('tasksTable.loading')}</span>
          </div>
        </div>
      );
    }

    if (tasksError) {
      return (
        <div className="p-8">
          <div className="text-center text-gray-500">
            <p>{getErrorMessage(tasksError)}</p>
          </div>
        </div>
      );
    }

    const tasks = tasksData?.items || [];

    if (tasks.length === 0) {
      return (
        <div className="p-8">
          <div className="text-center text-gray-500">
            <p>{t('tasksTable.noTasks')}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.taskTitle')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.taskStatus')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.priority')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.dueDate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.customer')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tasksTable.createdAt')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task: TaskItem) => (
              <tr key={task.taskItemId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {task.taskTitle}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.taskStatus)}`}>
                    {task.taskStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(task.dueDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {task.customerName || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(task.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Performance Tab Content
  const renderPerformanceContent = () => {
    if (isPerformanceLoading) {
      return (
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('performance.loading')}</span>
          </div>
        </div>
      );
    }

    if (performanceError) {
      return (
        <div className="p-8">
          <div className="text-center text-gray-500">
            <p>{getErrorMessage(performanceError)}</p>
          </div>
        </div>
      );
    }

    if (!performanceData) return null;

    return (
      <div className="space-y-6">
        {/* Performance Rating */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {performanceData.performanceRatingText}
            </h3>
            <div className="text-5xl font-bold text-red-500 mb-4">
              {performanceData.completionRatePercentage}%
            </div>
            <p className="text-gray-600">
              {t('performance.completionRate')}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hours */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              {t('performance.totalHours')}
            </h4>
            <div className="text-2xl font-bold text-gray-900">
              {performanceData.totalHoursWorked}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {t('performance.avgHoursPerTask')}: {performanceData.averageHoursPerTask}
            </p>
          </div>

          {/* Task Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              {t('performance.taskStatus')}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('performance.completed')}</span>
                <span className="font-medium text-gray-900">{performanceData.completedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('performance.inProgress')}</span>
                <span className="font-medium text-gray-900">{performanceData.inProgressCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('performance.pending')}</span>
                <span className="font-medium text-gray-900">{performanceData.pendingCount}</span>
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              {t('performance.overdueTasks')}
            </h4>
            <div className="text-2xl font-bold text-gray-900">
              {performanceData.overdueCount}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {t('performance.overdueTasksDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('title', { employeeName: employeeDetails.fullName })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleEdit}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-md"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              {t('edit')}
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-md"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {t('delete')}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('basicInformation')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('fullName')}:
                </label>
                <p className="text-gray-900 font-medium">{employeeDetails.fullName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('email')}:
                </label>
                <p className="text-gray-900">{employeeDetails.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('accountStatus')}:
                </label>
                {getStatusBadge(employeeDetails.isActive)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('assignedTasksCount')}:
                </label>
                <p className="text-gray-900 font-bold">{(employeeDetails as EmployeeDetails).relatedTaskCount}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('creationDate')}:
                </label>
                <p className="text-gray-900">{t('notSpecified')}</p>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('grantedPermissions')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(employeeDetails as EmployeeDetails).permissions.map((permission: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={true} 
                    readOnly 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-label={`Permission: ${permission}`}
                  />
                  <span className="text-sm text-gray-900">{t(`permissionsList.${permission}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="tasks">{t('tabs.tasks')}</TabsTrigger>
              <TabsTrigger value="performance">{t('tabs.performance')}</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              {/* Tasks Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                  <div className="w-1 h-6 bg-red-500"></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('tasksTable.title')}
                  </h3>
                </div>
                {renderTasksTable()}
              </div>
            </TabsContent>

            <TabsContent value="performance">
              {renderPerformanceContent()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 