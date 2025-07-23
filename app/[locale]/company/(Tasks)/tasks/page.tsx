/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTasks, useAddTask, useUpdateTask } from '@/hooks/useTasks';
import type { Task } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Search, Filter, AlertCircle, Eye, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEmployees } from '@/hooks/useEmployees';
import { useCustomers } from '@/hooks/useCustomers';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { tasksApi } from '@/lib/api';

interface TopUser {
  userName: string;
  completedTaskCount: number;
}

interface TaskStats {
  averageTimeToComplete: number;
  completedTasks: number;
  totalTasks: number;
  topUsersByCompletedTasks: TopUser[];
}

interface TasksResponse {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  items: Task[];
  stats: TaskStats;
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  taskToEdit?: Task;
}

function TaskModal({ open, onOpenChange, taskToEdit }: TaskModalProps) {
  const t = useTranslations('company.tasks.addTaskModal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { data: employees } = useEmployees();
  const { data: customers } = useCustomers();

  const [formError, setFormError] = useState<string | null>(null);
  
  // Initialize form when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.taskTitle);
      setEmployeeId(taskToEdit.assignedToUserId?.toString() || '');
      setCustomerId(taskToEdit.customerId?.toString() || '');
      setPriority(taskToEdit.priority);
      setDueDate(new Date(taskToEdit.dueDate).toISOString().slice(0, 16));
      // Fetch task details for description and notes
      const fetchTaskDetails = async () => {
        try {
          const details = await tasksApi.getTaskDetails(taskToEdit.taskItemId);
          setDescription(details.description);
          setNotes(details.notes);
        } catch (error) {
          console.error('Error fetching task details:', error);
          setFormError('Failed to load task details');
        }
      };
      fetchTaskDetails();
    }
  }, [taskToEdit]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setEmployeeId('');
      setCustomerId('');
      setPriority('');
      setDueDate('');
      setNotes('');
      setFiles([]);
      setFormError(null);
    }
  }, [open]);

  const addTaskMutation = useAddTask({
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Add Task API error:', error);
      setFormError(error.message || 'Failed to add task');
    },
  });

  const updateTaskMutation = useUpdateTask({
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update Task API error:', error);
      setFormError(error.message || 'Failed to update task');
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!employeeId) {
      setFormError('Please select an employee');
      return;
    }
    if (!customerId) {
      setFormError('Please select a customer');
      return;
    }
    if (!priority) {
      setFormError('Priority is required');
      return;
    }
    if (!dueDate) {
      setFormError('Due date is required');
      return;
    }
    if (!notes.trim()) {
      setFormError('Notes are required');
      return;
    }
    if (!taskToEdit && files.length === 0) {
      setFormError('At least one requirement file is required');
      return;
    }

    const taskData = {
      AssignedToUserId: Number(employeeId),
      CustomerId: Number(customerId),
      TaskTitle: title.trim(),
      Description: description.trim(),
      Priority: priority,
      DueDate: new Date(dueDate).toISOString(),
      Notes: notes.trim(),
      requirementFiles: files,
    };

    if (taskToEdit) {
      updateTaskMutation.mutate({
        ...taskData,
        taskItemId: taskToEdit.taskItemId,
      });
    } else {
      addTaskMutation.mutate(taskData);
    }
  }

  const isSubmitting = addTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full sm:max-w-lg md:max-w-2xl px-2 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {taskToEdit ? t('editTitle') : t('title')}
          </DialogTitle>
          <DialogDescription>
            {taskToEdit ? t('editSubtitle') : t('subtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <div className="text-lg font-semibold text-red-600 mb-4">{t('sectionTitle')}</div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <div>
              <Label className="my-2" htmlFor="task-title">{t('fields.title')}</Label>
              <Input id="task-title" placeholder={t('fields.titlePlaceholder')} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="my-2" htmlFor="task-desc">{t('fields.description')}</Label>
              <Textarea id="task-desc" placeholder={t('fields.descriptionPlaceholder')} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 min-w-0">
                <Label className="my-2" htmlFor="employee">{t('fields.employee')}</Label>
                <select
                  id="employee"
                  title={t('fields.employeePlaceholder')}
                  className="w-full border rounded px-3 py-2"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                >
                  <option value="">{t('fields.employeePlaceholder')}</option>
                  {employees?.employees?.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <Label className="my-2" htmlFor="customer">{t('fields.customer')}</Label>
                <select
                  id="customer"
                  title={t('fields.customerPlaceholder')}
                  className="w-full border rounded px-3 py-2"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                >
                  <option value="">{t('fields.customerPlaceholder')}</option>
                  {customers?.customers?.map(cust => (
                    <option key={cust.customerId} value={cust.customerId}>{cust.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 min-w-0">
                <Label className="my-2" htmlFor="priority">{t('fields.priorityPlaceholder')}</Label>
                <select
                  title="peririty"
                  id="priority"
                  className="w-full border rounded px-3 py-2"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="">{t('fields.priorityPlaceholder')}</option>
                  <option value="Low">{t('priority.low')}</option>
                  <option value="Medium">{t('priority.medium')}</option>
                  <option value="High">{t('priority.high')}</option>
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <Label className="my-2" htmlFor="due-date">{t('fields.dueDate')}</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  placeholder={t('fields.dueDatePlaceholder')}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="my-2" htmlFor="notes">{t('fields.notes')}</Label>
              <Input id="notes" placeholder={t('fields.notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div>
              <Label className="my-2">{t('fields.fileUpload')}</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="block cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-4 4m4-4l4 4" />
                    </svg>
                    <span className="text-red-600">{t('fields.fileUploadHint')}</span>
                    <div className="text-xs text-gray-500 mt-1">{t('fields.fileUploadTypes')}</div>
                  </div>
                </label>
                {files.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700 break-words">
                    {files.map(file => <div key={file.name}>{file.name}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                type="submit"
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : taskToEdit ? t('actions.update') : t('actions.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('actions.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const t = useTranslations('company.tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTopUsersModal, setShowTopUsersModal] = useState(false);

  // Fetch all tasks
  const { data, isLoading, error } = useTasks() as { 
    data: TasksResponse | undefined; 
    isLoading: boolean; 
    error: Error | null;
  };

  // Filter and paginate tasks on the client side
  const filteredAndPaginatedTasks = useMemo(() => {
    if (!data?.items) return { items: [] as Task[], totalCount: 0, totalPages: 0 };

    // Apply filters
    let filtered = data.items as Task[];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((task: Task) => 
        task.taskTitle.toLowerCase().includes(searchLower) ||
        task.customerName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((task: Task) => 
        task.taskStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter((task: Task) => 
        task.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Calculate pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      totalPages,
    };
  }, [data?.items, searchTerm, statusFilter, priorityFilter, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  const { user } = useUserRole();

  // Get user permissions
  const getUserPermissions = (): string[] => {
    if (typeof window === 'undefined') return [];
    const permissions = localStorage.getItem('userPermissions');
    return permissions ? JSON.parse(permissions) : [];
  };

  const userPermissions = getUserPermissions();
  const canManageTasks = userPermissions.includes('can_manage_tasks');

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
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

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
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

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    } catch (e) {
      return dateString;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
                <span className="text-gray-700">{t('loading')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8">
              <div className="text-center text-gray-500">
                <div className="text-red-500 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('errorTitle')}</h3>
                <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'An error occurred while fetching tasks'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t('taskStats')}</h3>
              <div className="mt-2">
                <p className="text-2xl font-semibold text-gray-900">{data?.stats?.totalTasks || 0}</p>
                <p className="text-sm text-gray-600">{t('tasks')}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t('status.completed')}</h3>
              <div className="mt-2">
                <p className="text-2xl font-semibold text-green-600">{data?.stats?.completedTasks || 0}</p>
                <p className="text-sm text-gray-600">{t('tasks')}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t('averageTimeToComplete')}</h3>
              <div className="mt-2">
                <p className="text-2xl font-semibold text-blue-600">
                  {data?.stats?.averageTimeToComplete?.toFixed(2) || 0}
                </p>
                <p className="text-sm text-gray-600">{t('hours')}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t('topUsersByCompletedTasks')}</h3>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowTopUsersModal(true)}
                >
                  {t('viewTopEmployees')}
                </Button>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t('search')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/4">
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select 
                  title={t('filterByStatus')}
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">{t('filterByStatus')}</option>
                  <option value="Pending">{t('status.pending')}</option>
                  <option value="InProgress">{t('status.inProgress')}</option>
                  <option value="Completed">{t('status.completed')}</option>
                  <option value="Cancelled">{t('status.cancelled')}</option>
                </select>
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <div className="relative">
                <AlertCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select 
                  title={t('filterByPriority')}
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">{t('filterByPriority')}</option>
                  <option value="Low">{t('priority.low')}</option>
                  <option value="Medium">{t('priority.medium')}</option>
                  <option value="High">{t('priority.high')}</option>
                </select>
              </div>
            </div>
            {canManageTasks && (
              <div className="w-full md:w-auto flex flex-col gap-2">
                <Button 
                  className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-20"
                  onClick={() => {
                    setSelectedTask(undefined);
                    setShowTaskModal(true);
                  }}
                >
                  {t('addTask')}
                </Button>
                <Button variant="outline" className="w-full md:w-auto">
                <Link href="/company/tasks/gallery">
                 Tasks Gallery
                </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Tasks table */}
          {filteredAndPaginatedTasks.items.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('taskTitle')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('statusLabel')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('priorityLabel')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dueDate')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('createdAt')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndPaginatedTasks.items.map((task: Task) => (
                    <tr key={task.taskItemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {task.taskTitle}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.taskStatus)}`}>
                          {task.taskStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex gap-2">
                          <Link className="p-1 rounded hover:bg-gray-100" href={`/company/tasks/${task.taskItemId}`}>
                            <button
                              type="button"
                              aria-label={t('view')}
                              title={t('view')}
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                          </Link>
                          {canManageTasks && (
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskModal(true);
                              }}
                              aria-label={t('edit')}
                              title={t('edit')}
                            >
                              <Pencil className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(task.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <div className="text-center text-gray-500">
                <p>{t('noTasks')}</p>
              </div>
            </div>
          )}
        </CardContent>
        {filteredAndPaginatedTasks.totalPages > 1 && (
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t('showing')} {((currentPage - 1) * pageSize) + 1}-
              {Math.min(currentPage * pageSize, filteredAndPaginatedTasks.totalCount)} {t('of')} {filteredAndPaginatedTasks.totalCount}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={filteredAndPaginatedTasks.totalPages}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        )}
      </Card>

      {/* Task Modal */}
      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        taskToEdit={selectedTask}
      />

      {/* Top Users Modal */}
            <Dialog open={showTopUsersModal} onOpenChange={setShowTopUsersModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('topEmployeesModalTitle')}</DialogTitle>
                  <DialogDescription>{t('topEmployeesModalDesc')}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {data?.stats?.topUsersByCompletedTasks?.length ? (
                    <div className="space-y-4">
                      {data?.stats?.topUsersByCompletedTasks?.map((user: TopUser, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-semibold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.userName}</p>
                              <p className="text-sm text-gray-500">
                                {user.completedTaskCount} {t('tasks')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {t('noTopEmployees')}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
    </div>
  );
}
