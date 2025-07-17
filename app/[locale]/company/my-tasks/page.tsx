/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import type { Task } from '@/lib/api';
import { employeeApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Search, Filter, AlertCircle, Eye } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';

export default function MyTasksPage() {
  const t = useTranslations('company.tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { user } = useUserRole();

  // Fetch tasks for the current employee
  const { data, isLoading, error } = useQuery({
    queryKey: ['employeeTasks', user?.id],
    queryFn: () => user?.id ? employeeApi.getEmployeeTasks(Number(user.id)) : Promise.reject('No user ID'),
    enabled: !!user?.id,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, priorityFilter]);

  // Apply client-side search and filters
  const filteredItems = (data?.items || [])
    .filter((task: Task) =>
      (!searchTerm || task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || task.taskStatus === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter)
    );

  // Pagination logic
  const totalCount = filteredItems.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('myTasks')}</CardTitle>
            <CardDescription>{t('myTasksDescription')}</CardDescription>
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
            <CardTitle>{t('myTasks')}</CardTitle>
            <CardDescription>{t('myTasksDescription')}</CardDescription>
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
          <CardTitle>{t('myTasks')}</CardTitle>
          <CardDescription>{t('myTasksDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
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
          </div>

          {/* Tasks table */}
          {paginatedItems.length > 0 ? (
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
                  {paginatedItems.map((task: Task) => (
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
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t('showing')} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalCount)} {t('of')} {totalCount}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 