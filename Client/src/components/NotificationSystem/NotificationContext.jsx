import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const NotificationContext = createContext();

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch unread count on mount only once
  useEffect(() => {
    if (!hasInitialized) {
      fetchUnreadCount();
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      if (response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't update state on error to prevent re-renders
      // Don't throw error to prevent infinite loops
    }
  };

  const fetchNotifications = async (options = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications', { params: options });
      setNotifications(response.data.notifications);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't throw error to prevent infinite loops
      return { notifications: [] };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
      // Update unread count locally instead of making another API call
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Don't throw error to prevent infinite loops
    }
  };

  const markAllAsRead = async (category = null) => {
    try {
      const params = category ? { category } : {};
      await api.put('/api/notifications/mark-all-read', { params });
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      // Update unread count locally instead of making another API call
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Don't throw error to prevent infinite loops
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Update unread count locally if needed
      setUnreadCount(prev => {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        return deletedNotification && !deletedNotification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Don't throw error to prevent infinite loops
    }
  };

  const clearReadNotifications = async (category = null) => {
    try {
      const params = category ? { category } : {};
      await api.delete('/api/notifications/clear-read', { params });
      fetchNotifications();
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      // Don't throw error to prevent infinite loops
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const value = {
    unreadCount,
    notifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { useNotifications, NotificationProvider }; 