import { createContext, useContext, useState, useCallback, useMemo } from 'react';

import { Notification, NotificationCategory } from '../types/notification';
import { mockNotifications } from '../data/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  filterByCategory: (category: NotificationCategory | 'all') => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const filterByCategory = useCallback(
    (category: NotificationCategory | 'all') => {
      if (category === 'all') return notifications;
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, filterByCategory }),
    [notifications, unreadCount, markAsRead, markAllAsRead, filterByCategory]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
