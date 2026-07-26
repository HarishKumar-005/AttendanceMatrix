import { useState, useEffect, useCallback } from 'react';
import {
  TeacherNotification,
  NotificationAnalytics,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  clearAllNotifications,
  fetchNotificationAnalytics,
} from '../api/client';

export interface ToastItem {
  id: string;
  notification: TeacherNotification;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const [list, count, stats] = await Promise.all([
        fetchNotifications({ unread_only: activeTab === 'unread' }),
        fetchUnreadNotificationCount(),
        fetchNotificationAnalytics(),
      ]);

      setNotifications(list);
      setUnreadCount(count);
      setAnalytics(stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadNotifications();

    // Setup lightweight background polling sync every 8 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 8000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (analytics) {
        setAnalytics({ ...analytics, unread_count: Math.max(0, analytics.unread_count - 1) });
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const nowStr = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: nowStr })));
      setUnreadCount(0);
      if (analytics) {
        setAnalytics({ ...analytics, unread_count: 0 });
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const dismiss = async (id: string) => {
    try {
      await dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      loadNotifications();
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const clearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      loadNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const togglePanel = () => setIsOpen((prev) => !prev);
  const closePanel = () => setIsOpen(false);

  return {
    notifications,
    unreadCount,
    analytics,
    loading,
    error,
    isOpen,
    activeTab,
    setActiveTab,
    togglePanel,
    closePanel,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    refresh: loadNotifications,
  };
}
