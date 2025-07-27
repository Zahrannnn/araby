"use client"

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, CalendarIcon, ClockIcon, UserIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useTaskDetails } from '@/hooks/useCustomers'
import type { TaskDetails } from '@/lib/api'

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
}

export function ViewTaskModal({ 
  isOpen, 
  onClose, 
  taskId 
}: ViewTaskModalProps) {
  const t = useTranslations('company.tasks.viewModal');
  
  // Fetch detailed task data from API
  const { data: taskDetails, isLoading, error } = useTaskDetails(taskId);

  // Log task details when data is fetched
  useEffect(() => {
    if (taskDetails) {
      console.log('=== TASK DETAILS FETCHED ===');
      console.log('Task ID:', taskId);
      console.log('Full task details object:', taskDetails);
      console.log('Task structure:');
      console.log('- taskItemId:', taskDetails.taskItemId);
      console.log('- taskTitle:', taskDetails.taskTitle);
      console.log('- description:', taskDetails.description);
      console.log('- taskStatus:', taskDetails.taskStatus);
      console.log('- priority:', taskDetails.priority);
      console.log('- dueDate:', taskDetails.dueDate);
      console.log('- startedAt:', taskDetails.startedAt);
      console.log('- createdAt:', taskDetails.createdAt);
      console.log('- completedDate:', taskDetails.completedDate);
      console.log('- timeSpentInHours:', taskDetails.timeSpentInHours);
      console.log('- notes:', taskDetails.notes);
      console.log('- assignedToName:', taskDetails.assignedToName);
      console.log('- isInProgress:', taskDetails.isInProgress);
      console.log('- isItForAssignedEmployee:', taskDetails.isItForAssignedEmployee);
      console.log('- requirementFiles:', taskDetails.requirementFiles);
      console.log('- resultFiles:', taskDetails.resultFiles);
      console.log('=== END TASK DETAILS ===');
    }
  }, [taskDetails, taskId]);

  // Log loading and error states
  useEffect(() => {
    if (isLoading && taskId) {
      console.log(`Loading task details for task ID: ${taskId}`);
    }
  }, [isLoading, taskId]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching task details:', error);
    }
  }, [error]);

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">Loading task details...</span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Task</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!taskDetails) return null;

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  // Format datetime
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString("de-DE");
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

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                Task Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Task #{taskDetails.taskItemId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(taskDetails.priority)}`}>
              {taskDetails.priority} Priority
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(taskDetails.taskStatus)}`}>
              {taskDetails.taskStatus}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Title and Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{taskDetails.taskTitle}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-900 whitespace-pre-wrap">{taskDetails.description || 'No description provided'}</p>
            </div>
          </div>

          {/* Task Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Assigned To */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium text-gray-900">{taskDetails.assignedToName}</p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(taskDetails.dueDate)}</p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">{formatDateTime(taskDetails.createdAt)}</p>
              </div>
            </div>

            {/* Time Spent */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Spent</p>
                <p className="font-medium text-gray-900">
                  {taskDetails.timeSpentInHours ? `${taskDetails.timeSpentInHours} hours` : 'Not tracked'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Dates */}
          {(taskDetails.startedAt || taskDetails.completedDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {taskDetails.startedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Started At</p>
                  <p className="text-gray-900">{formatDateTime(taskDetails.startedAt)}</p>
                </div>
              )}
              {taskDetails.completedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Completed At</p>
                  <p className="text-gray-900">{formatDateTime(taskDetails.completedDate)}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {taskDetails.notes && (
            <div className="mb-6">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{taskDetails.notes}</p>
              </div>
            </div>
          )}

          {/* Files Section */}
          {(taskDetails.requirementFiles.length > 0 || taskDetails.resultFiles.length > 0) && (
            <div className="space-y-4">
              {/* Requirement Files */}
              {taskDetails.requirementFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <DocumentIcon className="h-4 w-4" />
                    Requirement Files ({taskDetails.requirementFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {taskDetails.requirementFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
                        <DocumentIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{file.fileType}</p>
                        </div>
                        {file.fileUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`https://nedx.premiumasp.net${file.fileUrl}`, '_blank')}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Files */}
              {taskDetails.resultFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <DocumentIcon className="h-4 w-4" />
                    Result Files ({taskDetails.resultFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {taskDetails.resultFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border">
                        <DocumentIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{file.fileType}</p>
                        </div>
                        {file.fileUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`https://nedx.premiumasp.net${file.fileUrl}`, '_blank')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${taskDetails.isInProgress ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-700">
                {taskDetails.isInProgress ? 'Currently in progress' : 'Not in progress'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${taskDetails.isItForAssignedEmployee ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-700">
                {taskDetails.isItForAssignedEmployee ? 'For assigned employee' : 'Not for assigned employee'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 