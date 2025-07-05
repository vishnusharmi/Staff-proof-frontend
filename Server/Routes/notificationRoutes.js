const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models and services
const Notification = require('../Modals/Notification');
const NotificationService = require('../Services/notificationService');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole 
} = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/notifications
// @desc    Get user notifications with filtering and pagination
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    category, 
    read, 
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    category,
    read: read === 'true' ? true : read === 'false' ? false : null,
    priority
  };

  const result = await NotificationService.getUserNotifications(req.user._id, options);

  sendSuccessResponse(res, {
    notifications: result.notifications,
    pagination: result.pagination
  });
}));

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('Unread count request - User:', req.user);
    
    if (!req.user || !req.user._id) {
      console.log('Authentication failed - no user or user._id');
      return sendErrorResponse(res, 401, 'User not authenticated');
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.log('Invalid user ID:', req.user._id);
      return sendErrorResponse(res, 400, 'Invalid user ID');
    }
    
    // Check if Notification model is properly imported
    if (!Notification) {
      console.error('Notification model is not imported');
      return sendErrorResponse(res, 500, 'Notification model not available');
    }
    
    console.log('Calling NotificationService.getUnreadCount with userId:', req.user._id);
    const count = await NotificationService.getUnreadCount(req.user._id);
    console.log('Unread count result:', count);
    
    sendSuccessResponse(res, { count });
  } catch (error) {
    console.error('Error in unread-count route:', error);
    console.error('Error stack:', error.stack);
    return sendErrorResponse(res, 500, `Internal server error: ${error.message}`);
  }
}));

// @route   GET /api/notifications/:id
// @desc    Get specific notification
// @access  Private
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  }).populate('sender', 'firstName lastName email');

  if (!notification) {
    return sendErrorResponse(res, 404, 'Notification not found');
  }

  sendSuccessResponse(res, { notification });
}));

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
  
  sendSuccessResponse(res, { 
    notification,
    message: 'Notification marked as read'
  });
}));

// @route   PUT /api/notifications/:id/unread
// @desc    Mark notification as unread
// @access  Private
router.put('/:id/unread', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return sendErrorResponse(res, 404, 'Notification not found');
  }

  await notification.markAsUnread();
  
  sendSuccessResponse(res, { 
    notification,
    message: 'Notification marked as unread'
  });
}));

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authenticateToken, asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  await NotificationService.markAllAsRead(req.user._id, category);
  
  sendSuccessResponse(res, { 
    message: category 
      ? `All ${category} notifications marked as read`
      : 'All notifications marked as read'
  });
}));

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await NotificationService.deleteNotification(req.params.id, req.user._id);
  
  sendSuccessResponse(res, { 
    message: 'Notification deleted successfully',
    notification
  });
}));

// @route   DELETE /api/notifications/clear-read
// @desc    Clear all read notifications
// @access  Private
router.delete('/clear-read', authenticateToken, asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const query = {
    recipient: req.user._id,
    read: true
  };
  
  if (category) {
    query.category = category;
  }

  const result = await Notification.deleteMany(query);
  
  sendSuccessResponse(res, { 
    message: `${result.deletedCount} read notifications cleared`,
    deletedCount: result.deletedCount
  });
}));

// @route   POST /api/notifications/test
// @desc    Send test notification (Admin only)
// @access  Private/Admin
router.post('/test', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    recipientId, 
    title, 
    message, 
    type = 'info', 
    category = 'system',
    priority = 'medium',
    channels = { inApp: true, email: true }
  } = req.body;

  const notificationData = {
    recipient: recipientId,
    title,
    message,
    type,
    category,
    priority,
    channels,
    action: {
      type: 'none'
    }
  };

  const notification = await NotificationService.createNotification(notificationData);
  
  sendSuccessResponse(res, { 
    notification,
    message: 'Test notification sent successfully'
  });
}));

// @route   POST /api/notifications/bulk
// @desc    Send bulk notifications (Admin only)
// @access  Private/Admin
router.post('/bulk', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    recipientIds, 
    title, 
    message, 
    type = 'info', 
    category = 'system',
    priority = 'medium',
    channels = { inApp: true, email: true }
  } = req.body;

  const notifications = recipientIds.map(recipientId => ({
    recipient: recipientId,
    title,
    message,
    type,
    category,
    priority,
    channels,
    action: {
      type: 'none'
    }
  }));

  const createdNotifications = await NotificationService.createBulkNotifications(notifications);
  
  sendSuccessResponse(res, { 
    notifications: createdNotifications,
    message: `${createdNotifications.length} notifications sent successfully`
  });
}));

// @route   GET /api/notifications/stats
// @desc    Get notification statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const [
    totalNotifications,
    unreadNotifications,
    notificationsByType,
    notificationsByCategory,
    deliveryStats
  ] = await Promise.all([
    Notification.countDocuments({ createdAt: { $gte: daysAgo } }),
    Notification.countDocuments({ 
      read: false, 
      createdAt: { $gte: daysAgo } 
    }),
    Notification.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Notification.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Notification.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: null,
          emailSent: { $sum: { $cond: ['$deliveryStatus.email.sent', 1, 0] } },
          smsSent: { $sum: { $cond: ['$deliveryStatus.sms.sent', 1, 0] } },
          pushSent: { $sum: { $cond: ['$deliveryStatus.push.sent', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ])
  ]);

  const stats = {
    period: `${period} days`,
    total: totalNotifications,
    unread: unreadNotifications,
    readRate: totalNotifications > 0 ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(2) : 0,
    byType: notificationsByType,
    byCategory: notificationsByCategory,
    delivery: deliveryStats[0] || { emailSent: 0, smsSent: 0, pushSent: 0, total: 0 }
  };

  sendSuccessResponse(res, { stats });
}));

// @route   GET /api/notifications/test-connection
// @desc    Test notification model and database connection
// @access  Private
router.get('/test-connection', authenticateToken, asyncHandler(async (req, res) => {
  try {
    console.log('Testing notification connection...');
    
    // Test basic model functionality
    const totalCount = await Notification.countDocuments({});
    console.log('Total notifications in database:', totalCount);
    
    // Test user-specific query
    const userCount = await Notification.countDocuments({ recipient: req.user._id });
    console.log('User notifications count:', userCount);
    
    sendSuccessResponse(res, { 
      message: 'Notification model is working',
      totalNotifications: totalCount,
      userNotifications: userCount
    });
  } catch (error) {
    console.error('Error testing notification connection:', error);
    console.error('Error stack:', error.stack);
    return sendErrorResponse(res, 500, `Database connection error: ${error.message}`);
  }
}));

module.exports = router; 