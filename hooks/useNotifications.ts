'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi, queryKeys, type Notification } from '@/lib/api';

/**
 * Custom hook for managing notifications
 */
export function useNotifications() {
  const queryClient = useQueryClient();


  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: superAdminApi.getNotifications,
    staleTime: 30 * 1000, 
    gcTime: 5 * 60 * 1000, 
  });


  const markAsReadMutation = useMutation({
    mutationFn: superAdminApi.markNotificationAsRead,
    onSuccess: (_, notificationId) => {

      queryClient.setQueryData(queryKeys.notifications, (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(notification =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
      });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    },
  });


  const markAllAsReadMutation = useMutation({
    mutationFn: superAdminApi.markAllNotificationsAsRead,
    onSuccess: () => {

      queryClient.setQueryData(queryKeys.notifications, (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(notification => ({ ...notification, isRead: true }));
      });
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    },
  });


  const markAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'notifications.timeAgo.justNow';
    } else if (diffInMinutes < 60) {
      return { key: 'notifications.timeAgo.minutesAgo', count: diffInMinutes };
    } else if (diffInMinutes < 1440) { 
      const hours = Math.floor(diffInMinutes / 60);
      return { key: 'notifications.timeAgo.hoursAgo', count: hours };
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return { key: 'notifications.timeAgo.daysAgo', count: days };
    }
  };

  return {
    notifications,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    formatNotificationTime,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
} 