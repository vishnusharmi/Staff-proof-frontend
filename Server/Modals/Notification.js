const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Notification type and category
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'system'],
    default: 'info',
    index: true
  },

  category: {
    type: String,
    enum: [
      'verification',      // Document verification updates
      'billing',          // Payment and billing notifications
      'security',         // Security alerts
      'system',           // System maintenance and updates
      'profile',          // Profile updates and changes
      'access',           // Access request updates
      'company',          // Company-related notifications
      'employee',         // Employee-specific notifications
      'employer',         // Employer-specific notifications
      'admin',            // Admin notifications
      'verifier'          // Verifier-specific notifications
    ],
    required: true,
    index: true
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },

  // Action data (for interactive notifications)
  action: {
    type: {
      type: String,
      enum: ['link', 'button', 'modal', 'none'],
      default: 'none'
    },
    label: String,
    url: String,
    data: mongoose.Schema.Types.Mixed
  },

  // Related resources
  relatedResource: {
    type: {
      type: String,
      enum: ['user', 'company', 'verification_case', 'billing', 'access_request', 'document'],
      required: false
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedResource.type',
      required: false
    }
  },

  // Sender information (for notifications from other users)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Expiration and scheduling
  expiresAt: {
    type: Date,
    required: false,
    index: true
  },

  scheduledFor: {
    type: Date,
    required: false,
    index: true
  },

  // Delivery channels
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },

  // Delivery status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // System fields
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  readAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// Pre-save middleware to update readAt
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

// Static method to create bulk notifications
notificationSchema.statics.createBulkNotifications = async function(notifications) {
  try {
    const createdNotifications = await this.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Instance method to mark as unread
notificationSchema.methods.markAsUnread = async function() {
  this.read = false;
  this.readAt = undefined;
  return await this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    console.log('Notification.getUnreadCount called with userId:', userId);
    console.log('Query:', {
      recipient: userId,
      read: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    
    const count = await this.countDocuments({
      recipient: userId,
      read: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    
    console.log('countDocuments result:', count);
    return count;
  } catch (error) {
    console.error('Error in Notification.getUnreadCount:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId, category = null) {
  const query = {
    recipient: userId,
    read: false
  };
  
  if (category) {
    query.category = category;
  }

  return await this.updateMany(query, {
    read: true,
    readAt: new Date()
  });
};

// Static method to delete expired notifications
notificationSchema.statics.deleteExpired = async function() {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema); 