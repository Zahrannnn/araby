'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ArrowLeftIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { tasksApi, type TaskDetails } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';


export default function TaskDetailsPage() {
  const params = useParams();
  const t = useTranslations('company.tasks');
  const taskId = Number(params.taskId);
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: task } = useQuery<TaskDetails>({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTaskDetails(taskId),
  });

  // Add console log after the query
  console.log('Task data:', task);
  console.log('Requirement files:', task?.requirementFiles);
  console.log('Result files:', task?.resultFiles);

  const startTaskMutation = useMutation({
    mutationFn: () => tasksApi.startTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success(t('viewModal.taskStarted'));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('viewModal.errorStarting'));
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (files: File[]) => tasksApi.completeTask(taskId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success(t('viewModal.taskCompleted'));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('viewModal.errorCompleting'));
    },
  });

  const handleCompleteTask = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      completeTaskMutation.mutate(files);
    }
  };

  // Function to calculate elapsed time
  const calculateElapsedTime = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffInHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    const hours = Math.floor(diffInHours);
    const minutes = Math.floor((diffInHours - hours) * 60);
    const seconds = Math.floor(((diffInHours - hours) * 60 - minutes) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update timer every second if task is in progress
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (task?.isInProgress && task.startedAt) {
      // Initial calculation
      setElapsedTime(calculateElapsedTime(task.startedAt));

      // Update every second
      intervalId = setInterval(() => {
        setElapsedTime(calculateElapsedTime(task.startedAt!));
      }, 1000);
    }

    // Cleanup interval on unmount or when task changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [task?.isInProgress, task?.startedAt]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        aria-label={t('viewModal.resultFiles')}
        title={t('viewModal.resultFiles')}
      />

      {/* Back button */}
      <Link href="/company/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {t('viewModal.close')}
      </Link>

      {/* Status badges */}
      <div className="flex gap-2 mb-4">
        <Badge className={getStatusBadgeStyle(task.taskStatus)}>
          {t(`status.${task.taskStatus.toLowerCase()}`)}
        </Badge>
        {task.priority === 'High' && (
          <Badge variant="destructive">
            {t(`priority.${task.priority.toLowerCase()}`)}
          </Badge>
        )}
      </div>

      {/* Completion banner for completed tasks */}
      {task.taskStatus === 'Completed' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 flex items-center text-emerald-800">
          <CheckIcon className="h-6 w-6 mr-2" />
          <span className="font-medium">{t('viewModal.taskCompleted')}</span>
        </div>
      )}

      {/* Main content card */}
      <Card className="overflow-hidden">
        <div className="p-6">
          {/* Title with red bar */}
          <div className="relative mb-8">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            <h1 className="text-xl font-semibold pl-4">{task.taskTitle}</h1>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm text-gray-500 mb-1">{t('viewModal.description')}</h2>
            <p className="text-gray-900">{task.description}</p>
          </div>

          {/* Task metadata */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.assignedTo')}</h3>
              <p className="text-gray-900">{task.assignedToName}</p>
            </div>
           
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.customer')}</h3>
              <p className="text-gray-900">{task.customerName}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.createdAt')}</h3>
              <p className="text-gray-900">{format(new Date(task.createdAt), 'dd. MMMM yyyy um HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.startedAt')}</h3>
              <p className="text-gray-900">{format(new Date(task.startedAt || task.createdAt), 'dd. MMMM yyyy um HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.dueDate')}</h3>
              <p className="text-gray-900">{format(new Date(task.dueDate), 'dd. MMMM yyyy um HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.completedDate')}</h3>
              <p className="text-gray-900">{format(new Date(task.completedDate!), 'dd. MMMM yyyy um HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">{t('viewModal.timeSpentInHours')}</h3>
              <p className="text-gray-900">{task.timeSpentInHours ? task.timeSpentInHours : '-'}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h2 className="text-sm text-gray-500 mb-2">{t('viewModal.notes')}</h2>
            <div className="border rounded-lg p-4">
              <p className="text-gray-900">{task.notes || '-'}</p>
            </div>
          </div>

          {/* Files section */}
          {/* Requirement Files */}
          {task.requirementFiles.filter(file => file.fileType === 'Requirement').length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm text-gray-500 mb-4">{t('viewModal.requirementFiles')}</h2>
              <div className="space-y-2">
                {task.requirementFiles
                  .filter(file => file.fileType === 'Requirement')
                  .map((file) => (
                    <a
                      key={`https://crmproject.runasp.net/${file.fileUrl}`}
                      href={`https://crmproject.runasp.net/${file.fileUrl}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center bg-white rounded px-2 py-1 mr-3">
                        <span className="text-xs font-medium text-gray-600 uppercase">PDF</span>
                      </div>
                      <span className="flex-1 text-sm text-gray-900">{file.fileName}</span>
                      <svg 
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Result Files */}
          {task.resultFiles.filter(file => file.fileType === 'Result').length > 0 && (
            <div>
              <h2 className="text-sm text-gray-500 mb-4">{t('viewModal.resultFiles')}</h2>
              <div className="space-y-2">
                {task.resultFiles
                  .filter(file => file.fileType === 'Result')
                  .map((file) => (
                    <a
                      key={`https://crmproject.runasp.net/${file.fileUrl}`}
                      href={`https://crmproject.runasp.net/${file.fileUrl}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center bg-white rounded px-2 py-1 mr-3">
                        <span className="text-xs font-medium text-gray-600 uppercase">PDF</span>
                      </div>
                      <span className="flex-1 text-sm text-gray-900">{file.fileName}</span>
                      <svg 
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* No files message */}
          {task.requirementFiles.length === 0 && task.resultFiles.length === 0 && (
            <div className="text-gray-500 text-sm">
              {t('viewModal.noFiles', { defaultValue: 'No files available' })}
            </div>
          )}
        </div>

        {/* Timer and action buttons - only show for in-progress tasks */}
        {task.isInProgress && task.startedAt && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-700">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{t('viewModal.timeSpent')}:</span>
                <span className="ml-2 text-xl font-mono text-red-500">{elapsedTime}</span>
              </div>
              {task.isItForAssignedEmployee && (
                <Button 
                  variant="destructive"
                  onClick={handleCompleteTask}
                  disabled={completeTaskMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {completeTaskMutation.isPending ? t('viewModal.completing') : t('viewModal.complete')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Start task button - only show for pending tasks */}
        {task.isItForAssignedEmployee && task.taskStatus === 'Pending' && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <Button 
              variant="default"
              onClick={() => startTaskMutation.mutate()}
              disabled={startTaskMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {startTaskMutation.isPending ? t('viewModal.starting') : t('viewModal.start')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
