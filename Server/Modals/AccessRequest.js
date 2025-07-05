const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  // Request Information
  requestId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'AR_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Requesting Company
  requestingCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Requesting User (Employer)
  requestingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Target Employee
  targetEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Employee's Current Company
  employeeCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Request Details
  requestType: {
    type: String,
    enum: ['background_check', 'employment_verification', 'reference_check', 'general_inquiry'],
    required: true
  },
  
  reason: {
    type: String,
    required: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Requested Information
  requestedInformation: {
    employmentHistory: {
      type: Boolean,
      default: true
    },
    performanceRecords: {
      type: Boolean,
      default: false
    },
    salaryInformation: {
      type: Boolean,
      default: false
    },
    disciplinaryRecords: {
      type: Boolean,
      default: false
    },
    documents: {
      type: Boolean,
      default: true
    },
    contactInformation: {
      type: Boolean,
      default: false
    }
  },
  
  // Status and Processing
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  // Approval Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvalNotes: String,
  
  // Denial Information
  deniedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deniedAt: Date,
  denialReason: String,
  
  // Employee Response
  employeeResponse: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'no_response'],
      default: 'pending'
    },
    responseDate: Date,
    responseNotes: String,
    conditions: [String]
  },
  
  // Access Duration
  accessDuration: {
    type: Number, // in days
    default: 30,
    min: [1, 'Access duration must be at least 1 day'],
    max: [365, 'Access duration cannot exceed 365 days']
  },
  
  accessExpiryDate: {
    type: Date
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      required: true
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is expired
accessRequestSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for days until expiry
accessRequestSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is active
accessRequestSchema.virtual('isActive').get(function() {
  return this.status === 'approved' && !this.isExpired;
});

// Indexes
accessRequestSchema.index({ requestingCompany: 1 });
accessRequestSchema.index({ targetEmployee: 1 });
accessRequestSchema.index({ status: 1 });
accessRequestSchema.index({ createdAt: 1 });
accessRequestSchema.index({ expiresAt: 1 });
accessRequestSchema.index({ 'employeeResponse.status': 1 });

// Pre-save middleware to update timestamps and set expiry
accessRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set access expiry date when approved
  if (this.status === 'approved' && !this.accessExpiryDate) {
    this.accessExpiryDate = new Date(Date.now() + this.accessDuration * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance method to add audit log
accessRequestSchema.methods.addAuditLog = function(action, description, performedBy, metadata = {}) {
  this.auditLog.push({
    action,
    description,
    performedBy,
    metadata
  });
  return this.save();
};

// Instance method to add message
accessRequestSchema.methods.addMessage = function(sender, message, isInternal = false) {
  this.messages.push({
    sender,
    message,
    isInternal
  });
  return this.save();
};

// Instance method to approve request
accessRequestSchema.methods.approve = function(approvedBy, notes = '') {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalNotes = notes;
  this.accessExpiryDate = new Date(Date.now() + this.accessDuration * 24 * 60 * 60 * 1000);
  return this.save();
};

// Instance method to deny request
accessRequestSchema.methods.deny = function(deniedBy, reason = '') {
  this.status = 'denied';
  this.deniedBy = deniedBy;
  this.deniedAt = new Date();
  this.denialReason = reason;
  return this.save();
};

// Instance method to get employee response
accessRequestSchema.methods.setEmployeeResponse = function(status, notes = '', conditions = []) {
  this.employeeResponse.status = status;
  this.employeeResponse.responseDate = new Date();
  this.employeeResponse.responseNotes = notes;
  this.employeeResponse.conditions = conditions;
  return this.save();
};

module.exports = mongoose.model('AccessRequest', accessRequestSchema); 