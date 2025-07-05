const Notification = require('../Modals/Notification');
const User = require('../Modals/User');
const { SESService, emailTemplates } = require('./awsService');
const mongoose = require('mongoose');

class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(data) {
    try {
      const notification = await Notification.createNotification(data);
      
      // Send through different channels if specified
      if (notification.channels.email) {
        await this.sendEmailNotification(notification);
      }
      
      if (notification.channels.sms) {
        await this.sendSMSNotification(notification);
      }
      
      if (notification.channels.push) {
        await this.sendPushNotification(notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications
   */
  static async createBulkNotifications(notifications) {
    try {
      const createdNotifications = await Notification.createBulkNotifications(notifications);
      
      // Send through different channels
      for (const notification of createdNotifications) {
        if (notification.channels.email) {
          await this.sendEmailNotification(notification);
        }
        
        if (notification.channels.sms) {
          await this.sendSMSNotification(notification);
        }
        
        if (notification.channels.push) {
          await this.sendPushNotification(notification);
        }
      }
      
      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Send verification status notification
   */
  static async sendVerificationNotification(userId, status, caseId = null) {
    const user = await User.findById(userId);
    if (!user) return;

    const notificationData = {
      recipient: userId,
      title: `Document Verification ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
      message: `Your document verification has been ${status}. ${status === 'rejected' ? 'Please check the feedback and resubmit.' : ''}`,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
      category: 'verification',
      priority: status === 'rejected' ? 'high' : 'medium',
      action: {
        type: 'link',
        label: 'View Details',
        url: `/verification/${caseId || ''}`
      },
      relatedResource: caseId ? {
        type: 'verification_case',
        id: caseId
      } : undefined,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    };

    return await this.createNotification(notificationData);
  }

  /**
   * Send billing notification
   */
  static async sendBillingNotification(userId, billingData) {
    const notificationData = {
      recipient: userId,
      title: `Payment ${billingData.status === 'paid' ? 'Received' : 'Due'}`,
      message: billingData.status === 'paid' 
        ? `Payment of ₹${billingData.amount} has been received for invoice ${billingData.invoiceNumber}`
        : `Payment of ₹${billingData.amount} is due for invoice ${billingData.invoiceNumber}`,
      type: billingData.status === 'paid' ? 'success' : 'warning',
      category: 'billing',
      priority: billingData.status === 'paid' ? 'medium' : 'high',
      action: {
        type: 'link',
        label: 'View Invoice',
        url: `/billing/${billingData._id}`
      },
      relatedResource: {
        type: 'billing',
        id: billingData._id
      },
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    };

    return await this.createNotification(notificationData);
  }

  /**
   * Send access request notification
   */
  static async sendAccessRequestNotification(adminIds, requestData) {
    const notifications = adminIds.map(adminId => ({
      recipient: adminId,
      title: 'New Access Request',
      message: `${requestData.requester.firstName} ${requestData.requester.lastName} has requested ${requestData.requestType} access`,
      type: 'info',
      category: 'access',
      priority: 'medium',
      action: {
        type: 'link',
        label: 'Review Request',
        url: `/admin/access-requests/${requestData._id}`
      },
      relatedResource: {
        type: 'access_request',
        id: requestData._id
      },
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    }));

    return await this.createBulkNotifications(notifications);
  }

  /**
   * Send security alert
   */
  static async sendSecurityAlert(userId, alertType, details = {}) {
    const alertMessages = {
      'login': 'New login detected from an unrecognized device',
      'password_change': 'Your password has been changed',
      'profile_update': 'Your profile information has been updated',
      'document_upload': 'New documents have been uploaded to your account',
      'verification_request': 'A verification request has been submitted for your account'
    };

    const notificationData = {
      recipient: userId,
      title: 'Security Alert',
      message: alertMessages[alertType] || 'Security activity detected on your account',
      type: 'warning',
      category: 'security',
      priority: 'high',
      action: {
        type: 'link',
        label: 'Review Activity',
        url: '/security/activity'
      },
      channels: {
        inApp: true,
        email: true,
        sms: true,
        push: false
      },
      metadata: {
        alertType,
        details,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent
      }
    };

    return await this.createNotification(notificationData);
  }

  /**
   * Send system maintenance notification
   */
  static async sendSystemMaintenanceNotification(userIds, maintenanceData) {
    const notifications = userIds.map(userId => ({
      recipient: userId,
      title: 'System Maintenance Scheduled',
      message: `Scheduled maintenance on ${maintenanceData.date} from ${maintenanceData.startTime} to ${maintenanceData.endTime}. Service may be temporarily unavailable.`,
      type: 'warning',
      category: 'system',
      priority: 'medium',
      action: {
        type: 'none'
      },
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      },
      metadata: {
        maintenanceDate: maintenanceData.date,
        startTime: maintenanceData.startTime,
        endTime: maintenanceData.endTime,
        description: maintenanceData.description
      }
    }));

    return await this.createBulkNotifications(notifications);
  }

  /**
   * Send company-related notification
   */
  static async sendCompanyNotification(userId, action, companyData) {
    const actionMessages = {
      'created': 'Your company has been successfully created',
      'updated': 'Your company information has been updated',
      'verified': 'Your company has been verified',
      'employee_added': 'A new employee has been added to your company',
      'employee_removed': 'An employee has been removed from your company'
    };

    const notificationData = {
      recipient: userId,
      title: `Company ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: actionMessages[action] || `Company ${action} completed`,
      type: 'success',
      category: 'company',
      priority: 'medium',
      action: {
        type: 'link',
        label: 'View Company',
        url: '/company/profile'
      },
      relatedResource: {
        type: 'company',
        id: companyData._id
      },
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    };

    return await this.createNotification(notificationData);
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(notification) {
    try {
      const recipient = await User.findById(notification.recipient);
      if (!recipient || !recipient.email) return;

      let emailTemplate = 'notification';
      let templateData = {
        userName: recipient.firstName,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.action?.url,
        actionLabel: notification.action?.label
      };

      // Use specific templates for different categories
      if (notification.category === 'verification') {
        emailTemplate = 'verificationNotification';
      } else if (notification.category === 'billing') {
        emailTemplate = 'billingNotification';
      } else if (notification.category === 'security') {
        emailTemplate = 'securityAlert';
      }

      await SESService.sendEmail(
        recipient.email,
        notification.title,
        emailTemplates[emailTemplate]?.html(templateData) || emailTemplates.notification.html(templateData)
      );

      // Update delivery status
      notification.deliveryStatus.email.sent = true;
      notification.deliveryStatus.email.sentAt = new Date();
      await notification.save();

    } catch (error) {
      console.error('Error sending email notification:', error);
      notification.deliveryStatus.email.error = error.message;
      await notification.save();
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMSNotification(notification) {
    try {
      const recipient = await User.findById(notification.recipient);
      if (!recipient || !recipient.phone) return;

      // Implement SMS service integration here
      // For now, just log the SMS
      console.log(`SMS to ${recipient.phone}: ${notification.message}`);

      // Update delivery status
      notification.deliveryStatus.sms.sent = true;
      notification.deliveryStatus.sms.sentAt = new Date();
      await notification.save();

    } catch (error) {
      console.error('Error sending SMS notification:', error);
      notification.deliveryStatus.sms.error = error.message;
      await notification.save();
    }
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(notification) {
    try {
      const recipient = await User.findById(notification.recipient);
      if (!recipient) return;

      // Implement push notification service integration here
      // For now, just log the push notification
      console.log(`Push notification to ${recipient._id}: ${notification.message}`);

      // Update delivery status
      notification.deliveryStatus.push.sent = true;
      notification.deliveryStatus.push.sentAt = new Date();
      await notification.save();

    } catch (error) {
      console.error('Error sending push notification:', error);
      notification.deliveryStatus.push.error = error.message;
      await notification.save();
    }
  }

  /**
   * Get user notifications with pagination and filtering
   */
  static async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      type = null,
      category = null,
      read = null,
      priority = null
    } = options;

    const query = { recipient: userId };

    if (type) query.type = type;
    if (category) query.category = category;
    if (read !== null) query.read = read;
    if (priority) query.priority = priority;

    // Exclude expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await notification.markAsRead();
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId, category = null) {
    return await Notification.markAllAsRead(userId, category);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId) {
    try {
      console.log('NotificationService.getUnreadCount called with userId:', userId);
      console.log('UserId type:', typeof userId);
      console.log('UserId is ObjectId:', mongoose.Types.ObjectId.isValid(userId));
      
      const count = await Notification.getUnreadCount(userId);
      console.log('Notification.getUnreadCount result:', count);
      return count;
    } catch (error) {
      console.error('Error in NotificationService.getUnreadCount:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications() {
    return await Notification.deleteExpired();
  }
}

module.exports = NotificationService; 