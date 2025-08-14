/**
 * Notification types and interfaces
 */

/**
 * Notification entity
 */
export interface Notification {
  notificationId: number;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
} 