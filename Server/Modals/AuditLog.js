const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Log Information
  logId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'AUDIT_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Action Information
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication actions
      'login', 'logout', 'password_change', 'password_reset', 'account_lockout',
      
      // User management actions
      'user_create', 'user_update', 'user_delete', 'user_status_change', 'role_change',
      
      // Company actions
      'company_create', 'company_update', 'company_delete', 'company_verification',
      
      // Employee actions
      'employee_add', 'employee_remove', 'employee_update', 'employee_verification',
      
      // Verification actions
      'case_create', 'case_assign', 'case_update', 'case_complete', 'document_upload', 'document_verify',
      
      // Access request actions
      'access_request_create', 'access_request_approve', 'access_request_deny', 'access_request_expire',
      
      // Blacklist actions
      'blacklist_add', 'blacklist_remove', 'blacklist_update', 'blacklist_appeal',
      
      // Billing actions
      'subscription_create', 'subscription_update', 'subscription_cancel', 'payment_process', 'payment_fail',
      
      // System actions
      'system_config_change', 'backup_create', 'maintenance_start', 'maintenance_end',
      
      // Data actions
      'data_export', 'data_import', 'data_delete', 'data_anonymize',
      
      // Security actions
      'security_alert', 'suspicious_activity', 'breach_detected', 'compliance_check'
    ]
  },
  
  // Resource Information
  resource: {
    type: {
      type: String,
      enum: ['user', 'company', 'employee', 'verification_case', 'access_request', 'blacklist', 'billing', 'system', 'document'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    description: String
  },
  
  // Action Details
  details: {
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['authentication', 'authorization', 'data_access', 'data_modification', 'system_operation', 'security', 'compliance'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    requestId: String
  },
  
  // Changes and Metadata
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fields: [String]
  },
  
  // Context Information
  context: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    department: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'api', 'system']
    },
    browser: String,
    os: String
  },
  
  // Compliance Information
  compliance: {
    regulation: {
      type: String,
      enum: ['gdpr', 'ccpa', 'sox', 'hipaa', 'pci_dss', 'iso27001', 'other']
    },
    requirement: String,
    dataSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dataCategory: {
      type: String,
      enum: ['personal', 'sensitive', 'financial', 'health', 'other']
    },
    retentionPeriod: {
      type: Number, // in days
      default: 2555 // 7 years default
    }
  },
  
  // Risk Assessment
  risk: {
    level: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical'],
      default: 'none'
    },
    factors: [String],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Retention and Archival
  retention: {
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000); // 7 years
      }
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: Date,
    archiveLocation: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is expired
auditLogSchema.virtual('isExpired').get(function() {
  return this.retention.expiresAt && new Date() > this.retention.expiresAt;
});

// Virtual for days until expiry
auditLogSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.retention.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.retention.expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for risk level color
auditLogSchema.virtual('riskColor').get(function() {
  switch (this.risk.level) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'yellow';
    case 'low': return 'blue';
    default: return 'green';
  }
});

// Indexes
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'resource.type': 1 });
auditLogSchema.index({ 'resource.id': 1 });
auditLogSchema.index({ 'details.category': 1 });
auditLogSchema.index({ 'details.severity': 1 });
auditLogSchema.index({ 'risk.level': 1 });
auditLogSchema.index({ timestamp: 1 });
auditLogSchema.index({ 'compliance.regulation': 1 });

// TTL index for automatic deletion of expired logs
auditLogSchema.index({ 'retention.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to calculate risk score
auditLogSchema.pre('save', function(next) {
  // Calculate risk score based on various factors
  let score = 0;
  
  // Base score by action
  const actionScores = {
    'login': 1,
    'user_create': 5,
    'user_delete': 10,
    'company_delete': 15,
    'data_delete': 20,
    'security_alert': 25,
    'breach_detected': 50
  };
  
  score += actionScores[this.action] || 0;
  
  // Severity multiplier
  const severityMultipliers = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 5
  };
  
  score *= severityMultipliers[this.details.severity] || 1;
  
  // Risk level assignment
  if (score >= 40) this.risk.level = 'critical';
  else if (score >= 25) this.risk.level = 'high';
  else if (score >= 15) this.risk.level = 'medium';
  else if (score >= 5) this.risk.level = 'low';
  else this.risk.level = 'none';
  
  this.risk.score = Math.min(score, 100);
  
  next();
});

// Static method to get logs by user
auditLogSchema.statics.getUserLogs = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.action) query.action = options.action;
  if (options.startDate) query.timestamp = { $gte: options.startDate };
  if (options.endDate) {
    if (query.timestamp) {
      query.timestamp.$lte = options.endDate;
    } else {
      query.timestamp = { $lte: options.endDate };
    }
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .populate('user', 'firstName lastName email role');
};

// Static method to get high-risk activities
auditLogSchema.statics.getHighRiskActivities = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    'risk.level': { $in: ['high', 'critical'] },
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
};

// Static method to get compliance logs
auditLogSchema.statics.getComplianceLogs = function(regulation, startDate, endDate) {
  const query = { 'compliance.regulation': regulation };
  
  if (startDate && endDate) {
    query.timestamp = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

// Static method to get data access logs
auditLogSchema.statics.getDataAccessLogs = function(userId, resourceType, resourceId) {
  const query = {
    'details.category': 'data_access'
  };
  
  if (userId) query.user = userId;
  if (resourceType) query['resource.type'] = resourceType;
  if (resourceId) query['resource.id'] = resourceId;
  
  return this.find(query).sort({ timestamp: -1 });
};

// Static method to archive old logs
auditLogSchema.statics.archiveOldLogs = async function(archiveLocation) {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 2); // Archive logs older than 2 years
  
  const result = await this.updateMany(
    {
      timestamp: { $lt: cutoffDate },
      'retention.isArchived': false
    },
    {
      $set: {
        'retention.isArchived': true,
        'retention.archivedAt': new Date(),
        'retention.archiveLocation': archiveLocation
      }
    }
  );
  
  return result;
};

module.exports = mongoose.model('AuditLog', auditLogSchema); 