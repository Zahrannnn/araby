"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronLeftIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useCustomer, useCustomerTasks, useCustomerOffers } from '@/hooks/useCustomers'
import { DeleteCustomerModal } from './delete-customer-modal'
import { ViewOfferModal } from './view-offer-modal'
import { ViewTaskModal } from './view-task-modal'
import type { Customer, Offer } from '@/lib/api'

interface ViewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  customer: Customer | null;
}

// Type for customer tasks endpoint (api/Customer/id/tasks)
export interface CustomerTaskListItem {
  taskItemId: number;
  taskTitle: string;
  taskStatus: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  createdAt: string;
}

export function ViewCustomerModal({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  customer 
}: ViewCustomerModalProps) {
  const t = useTranslations('company.customers.viewModal');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [offersPage, setOffersPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const offersPageSize = 3;
  const tasksPageSize = 3;
  
  
  // Fetch detailed customer data from API if needed
  const { data: customerDetails, isLoading, error } = useCustomer(customer?.customerId || null);
  
  // Fetch customer tasks
  const { 
    data: tasksData, 
    isLoading: isTasksLoading, 
    error: tasksError 
  } = useCustomerTasks(customer?.customerId || null, tasksPage, tasksPageSize);

  // Fetch customer offers
  const { 
    data: offersData, 
    isLoading: isOffersLoading, 
    error: offersError 
  } = useCustomerOffers(customer?.customerId || null, offersPage, offersPageSize);

  // Use API data if available, otherwise fall back to basic customer data
  const displayData = React.useMemo(() => {
    const baseCustomer = customerDetails || customer;
    if (!baseCustomer) return null;

    return {
      fullName: baseCustomer.fullName || 'N/A',
      email: baseCustomer.email || 'N/A',
      phoneNumber: baseCustomer.phoneNumber || 'N/A',
      city: baseCustomer.city || 'N/A',
      address: baseCustomer.address || 'N/A',
      zipCode: baseCustomer.zipCode || 'N/A',
      country: baseCustomer.country || 'N/A',
      createdAt: baseCustomer.createdAt ? new Date(baseCustomer.createdAt).toLocaleDateString("de-DE") : 'N/A',
      notes: baseCustomer.notes || 'N/A',
      // Use real API data for metrics
      offerCount: baseCustomer.offerCount || 0,
      taskCount: baseCustomer.taskCount || 0,
      totalProfit: baseCustomer.totalProfit || 0
    };
  }, [customerDetails, customer]);

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('loading')}</span>
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
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : t('errorUnknown')}
            </p>
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

  if (!displayData) return null;

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (onDelete && customer) {
      onDelete(customer);
    }
    onClose();
  };

  // Format profit amount
  const formatProfit = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get offer status color
  const getOfferStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOffersTable = () => {
    if (isOffersLoading) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('offersTable.loading')}</span>
          </div>
        </div>
      );
    }

    if (offersError) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="text-center">
            <div className="text-red-500 mb-3">
              <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {offersError instanceof Error ? offersError.message : t('offersTable.errorUnknown')}
            </p>
          </div>
        </div>
      );
    }

    const offers = offersData?.items || [];

    if (offers.length === 0) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="text-center text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{t('offersTable.noOffers')}</p>
          </div>
        </div>
      );
    }

    const handleViewOffer = (offerId: number) => {
      setSelectedOfferId(offerId);
      setIsOfferModalOpen(true);
    };

    return (
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.offerNumber')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.issueDate')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.serviceType')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.totalAmount')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.status')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('offersTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer: Offer, index: number) => (
                <tr key={offer.offerId || index} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{offer.offerNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(offer.issueDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{offer.serviceTypeOverall}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatProfit(offer.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOfferStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewOffer(offer.offerId)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label={t('offersTable.actionsLabel')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Add pagination */}
        {offersData && offersData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              {t('showing')} {((offersPage - 1) * offersPageSize) + 1}-
              {Math.min(offersPage * offersPageSize, offersData.totalCount)} {t('of')} {offersData.totalCount}
            </div>
            <Pagination
              currentPage={offersPage}
              totalPages={offersData.totalPages}
              onPageChange={setOffersPage}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTasksTable = () => {
    if (isTasksLoading) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('tasksTable.loading')}</span>
          </div>
        </div>
      );
    }

    if (tasksError) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="text-center">
            <div className="text-red-500 mb-3">
              <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {tasksError instanceof Error ? tasksError.message : t('tasksTable.errorUnknown')}
            </p>
          </div>
        </div>
      );
    }

    const tasks = (tasksData?.items ?? []) as unknown as CustomerTaskListItem[];

    if (tasks.length === 0) {
      return (
        <div className="bg-white rounded-lg border p-8">
          <div className="text-center text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{t('tasksTable.noTasks')}</p>
          </div>
        </div>
      );
    }

    const handleViewTask = (taskId: number, taskData: CustomerTaskListItem) => {
      console.log('handleViewTask called with taskId:', taskId, 'taskData:', taskData);
      
      setSelectedTaskId(taskId);
      setIsTaskModalOpen(true);
      console.log('Task modal state set - selectedTaskId:', taskId, 'isTaskModalOpen:', true);
    };

    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.taskTitle')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.assignedTo')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.priority')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.status')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.dueDate')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.createdAt')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('tasksTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.taskItemId || index} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{task.taskTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{task.assignedTo}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.taskStatus)}`}>
                      {task.taskStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(task.dueDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(task.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        // Debug: Log the task object to see what's available
                        console.log('=== TASK CLICK DEBUG ===');
                        console.log('Full task object:', task);
                        console.log('All task object keys:', Object.keys(task));
                        console.log('task.taskItemId:', task.taskItemId);
                        console.log('task.taskItemId type:', typeof task.taskItemId);
                        console.log('task.taskItemId exists:', task.taskItemId !== undefined);
                        console.log('task.taskItemId > 0:', task.taskItemId && task.taskItemId > 0);
                        console.log('index:', index);
                        
                        // Try to find any ID field in the task object
                        const possibleIdFields = Object.keys(task).filter(key => 
                          key.toLowerCase().includes('id') || key.toLowerCase().includes('key')
                        );
                        console.log('Possible ID fields found:', possibleIdFields);
                        possibleIdFields.forEach(field => {
                          console.log(`${field}:`, task[field as keyof CustomerTaskListItem]);
                        });
                        
                        // Use taskItemId if it exists and is a valid number, otherwise show error
                        let taskId: number | null = null;
                        if (task.taskItemId && task.taskItemId > 0) {
                          taskId = task.taskItemId;
                          console.log('Using taskItemId:', taskId);
                        } else {
                          console.warn('❌ taskItemId is missing or invalid!');
                          console.warn('This means the tasks list API is not returning taskItemId');
                          console.warn('Available task data:', task);
                          
                          // Try to find another ID field or show an alert
                          const taskWithIds = task as CustomerTaskListItem & { id?: number; taskId?: number; itemId?: number };
                          const alternativeId = taskWithIds.id || taskWithIds.taskId || taskWithIds.itemId;
                          if (alternativeId) {
                            taskId = alternativeId;
                            console.log('Using alternative ID field:', alternativeId);
                          } else {
                            alert(`Cannot view task details: taskItemId is missing from the task data. Available fields: ${Object.keys(task).join(', ')}`);
                            return;
                          }
                        }
                        
                        console.log('Final taskId to be used for API call:', taskId);
                        console.log('=== END TASK CLICK DEBUG ===');
                        
                        if (taskId) {
                          handleViewTask(taskId, task);
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label={t('tasksTable.actionsLabel')}
                      title={task.taskItemId ? `View task #${task.taskItemId}` : 'View task details (ID missing)'}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add pagination */}
        {tasksData && tasksData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              {t('showing')} {((tasksPage - 1) * tasksPageSize) + 1}-
              {Math.min(tasksPage * tasksPageSize, tasksData.totalCount)} {t('of')} {tasksData.totalCount}
            </div>
            <Pagination
              currentPage={tasksPage}
              totalPages={tasksData.totalPages}
              onPageChange={setTasksPage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                  {t('title', { customerName: displayData.fullName })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleEdit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                {t('edit')}
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                {t('delete')}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-red-500 rounded"></div>
                <h3 className="text-lg font-medium text-gray-900">{t('basicInformation')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('fullName')}</p>
                      <p className="text-gray-900">{displayData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('city')}</p>
                      <p className="text-gray-900">{displayData.city}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('email')}</p>
                      <p className="text-gray-900">{displayData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('creationDate')}</p>
                      <p className="text-gray-900">{displayData.createdAt}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</p>
                  <p className="text-gray-900">{displayData.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Offers Card */}
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-blue-700 font-medium mb-1">{t('metrics.offersTitle')}</h4>
                <p className="text-2xl font-bold text-blue-900 mb-2">{displayData.offerCount}</p>
                <p className="text-xs text-blue-600">{t('metrics.offersSubtitle')}</p>
              </div>

              {/* Tasks Card */}
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-green-700 font-medium mb-1">{t('metrics.tasksTitle')}</h4>
                <p className="text-2xl font-bold text-green-900 mb-2">{displayData.taskCount}</p>
                <p className="text-xs text-green-600">{t('metrics.tasksSubtitle')}</p>
              </div>

              {/* Profit Card */}
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-red-700 font-medium mb-1">{t('metrics.profitTitle')}</h4>
                <p className="text-2xl font-bold text-red-900 mb-2">{formatProfit(displayData.totalProfit)}</p>
                <p className="text-xs text-red-600">{t('metrics.profitSubtitle')}</p>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="offers" 
                  className={`${activeTab === 'offers' ? 'bg-red-500 text-white shadow-md' : ''}`}
                >
                  {t('tabs.offers')}
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className={`${activeTab === 'tasks' ? 'bg-red-500 text-white shadow-md' : ''}`}
                >
                  {t('tabs.tasks')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="offers" className="mt-6">
                {renderOffersTable()}
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-6">
                {renderTasksTable()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        customer={customer}
      />

      {/* View Offer Modal */}
      <ViewOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setSelectedOfferId(null);
        }}
        offerId={selectedOfferId}
      />

      {/* View Task Modal */}
      <ViewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
      />
    </>
  );
} 