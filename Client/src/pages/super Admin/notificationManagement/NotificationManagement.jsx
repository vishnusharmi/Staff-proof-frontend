import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  BarChart3, 
  Filter, 
  Search,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    read: '',
    priority: ''
  });

  // Form state for sending notifications
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    priority: 'medium',
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: false
    }
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
    fetchStats();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        params: {
          page: 1,
          limit: 50,
          ...filters
        }
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/notifications/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendNotification = async () => {
    try {
      setLoading(true);
      
      if (selectedUsers.length === 0) {
        alert('Please select at least one user');
        return;
      }

      if (selectedUsers.length === 1) {
        // Send to single user
        await axios.post('/api/notifications/test', {
          recipientId: selectedUsers[0],
          ...notificationForm
        });
      } else {
        // Send to multiple users
        await axios.post('/api/notifications/bulk', {
          recipientIds: selectedUsers,
          ...notificationForm
        });
      }

      alert(`Notification sent to ${selectedUsers.length} user(s)`);
      setShowSendForm(false);
      setSelectedUsers([]);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        priority: 'medium',
        channels: {
          inApp: true,
          email: true,
          sms: false,
          push: false
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
        </div>
        <button
          onClick={() => setShowSendForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.readRate || 0}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Email Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivery?.emailSent || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      {showSendForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <select
                multiple
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Selected: {selectedUsers.length} user(s)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={notificationForm.category}
                onChange={(e) => setNotificationForm({...notificationForm, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="system">System</option>
                <option value="verification">Verification</option>
                <option value="billing">Billing</option>
                <option value="security">Security</option>
                <option value="profile">Profile</option>
                <option value="access">Access</option>
                <option value="company">Company</option>
                <option value="employee">Employee</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
                <option value="verifier">Verifier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={notificationForm.priority}
                onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter notification title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Enter notification message"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Channels
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.channels.inApp}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: {...notificationForm.channels, inApp: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  In-App
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.channels.email}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: {...notificationForm.channels, email: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  Email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.channels.sms}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: {...notificationForm.channels, sms: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  SMS
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.channels.push}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: {...notificationForm.channels, push: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  Push
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowSendForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={sendNotification}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="system">System</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            <option value="verification">Verification</option>
            <option value="billing">Billing</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="profile">Profile</option>
            <option value="access">Access</option>
            <option value="company">Company</option>
            <option value="employee">Employee</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
            <option value="verifier">Verifier</option>
          </select>

          <select
            value={filters.read}
            onChange={(e) => setFilters({...filters, read: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setFilters({type: '', category: '', read: '', priority: ''})}
            className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Notifications</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">No notifications match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <div key={notification._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {!notification.read && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {notification.category}</span>
                        <span>Type: {notification.type}</span>
                        <span>Recipient: {notification.recipient?.firstName} {notification.recipient?.lastName}</span>
                        <span>{notification.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement; 