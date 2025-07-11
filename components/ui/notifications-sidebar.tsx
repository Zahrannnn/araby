"use client";

import { useTranslations } from "next-intl";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function NotificationsSidebar({
  isOpen,
  onClose,
  className,
}: NotificationsSidebarProps) {
  const t = useTranslations();
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    formatNotificationTime,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const renderTimeAgo = (createdAt: string) => {
    const timeInfo = formatNotificationTime(createdAt);

    if (typeof timeInfo === "string") {
      return t(timeInfo) || "Vor 6 Stunden";
    }

    return (
      t(timeInfo.key, { count: timeInfo.count }) ||
      `Vor ${timeInfo.count} ${
        timeInfo.key.includes("minutes")
          ? "Minuten"
          : timeInfo.key.includes("hours")
          ? "Stunden"
          : "Tagen"
      }`
    );
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className=" size-10 bg-red-500 rounded-lg flex items-center justify-center relative">
              <svg
                width="27"
                height="25"
                viewBox="0 0 27 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.3956 24.2413C24.1377 24.2413 25.556 22.8537 25.5715 21.1425C25.5715 20.2792 25.2169 19.4467 24.5848 18.83L23.7369 17.9975C22.9352 17.2112 22.4881 16.1629 22.4881 15.0529V10.875C22.4881 9.61082 22.2877 8.34666 21.7789 7.17499C20.2681 3.69083 16.8456 1.59413 13.2227 1.60955C8.11979 1.60955 3.98812 5.66413 3.98812 10.6591V15.0375C3.98812 16.1475 3.54104 17.1958 2.73937 17.982L1.89145 18.8146C1.25937 19.4312 0.904785 20.2637 0.904785 21.1271C0.904785 22.8383 2.32311 24.2258 4.08061 24.2258H22.411L22.3956 24.2413Z"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('notifications.title') || 'Benachrichtigungen'}
              </h2>
              <p className="text-sm text-gray-500">{t('notifications.subtitle') || 'Benachrichtigungszentrum'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Mark all as read button */}
        <div className="px-4 pb-4">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead || notifications.length === 0}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {isMarkingAllAsRead
                ? t('notifications.markingAllAsRead') || "Wird als gelesen markiert..."
                : t('notifications.markAllAsRead') || "Alle als gelesen markieren"}
            </span>
          </Button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">
                Fehler beim Laden der Benachrichtigungen
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Erneut versuchen
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Keine Benachrichtigungen</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-colors relative",
                  !notification.isRead
                    ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                )}
                onClick={() => handleMarkAsRead(notification.notificationId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-red-600 font-semibold text-sm">
                        {notification.type || "Super Admin"}
                      </h3>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          !notification.isRead ? "bg-red-500" : "bg-green-500"
                        )}
                      ></div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {renderTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                </div>
                {isMarkingAsRead && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
