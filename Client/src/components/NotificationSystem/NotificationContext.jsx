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

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Temporarily disable polling to test continuous reloading
    // const pollInterval = process.env.NODE_ENV === 'development' ? 120000 : 60000; // 2 min in dev, 1 min in prod
    // const interval = setInterval(() => {
    //   fetchUnreadCount();
    // }, pollInterval);

    // return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      if (response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't update state on error to prevent re-renders
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
      throw error;
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
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (category = null) => {
    try {
      const params = category ? { category } : {};
      await api.put('/api/notifications/mark-all-read', { params });
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const clearReadNotifications = async (category = null) => {
    try {
      const params = category ? { category } : {};
      await api.delete('/api/notifications/clear-read', { params });
      fetchNotifications();
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      throw error;
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