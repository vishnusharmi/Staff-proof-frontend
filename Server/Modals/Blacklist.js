const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  // Blacklist Entry Information
  blacklistId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'BL_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Entity Information
  entityType: {
    type: String,
    enum: ['employee', 'company'],
    required: true
  },
  
  entity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel',
    required: true
  },
  
  entityModel: {
    type: String,
    required: true,
    enum: ['User', 'Company']
  },
  
  // Blacklisting Information
  blacklistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  blacklistedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  blacklistDate: {
    type: Date,
    default: Date.now
  },
  
  // Reason and Details
  reason: {
    type: String,
    required: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },
  
  category: {
    type: String,
    enum: [
      'fraud', 'misconduct', 'performance', 'policy_violation', 
      'legal_issues', 'security_breach', 'harassment', 'other'
    ],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Evidence and Documentation
  evidence: [{
    type: {
      type: String,
      enum: ['document', 'witness_statement', 'investigation_report', 'legal_document', 'other'],
      required: true
    },
    description: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Status and Duration
  status: {
    type: String,
    enum: ['active', 'expired', 'removed', 'under_review'],
    default: 'active'
  },
  
  duration: {
    type: Number, // in days, 0 for permanent
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  
  expiryDate: {
    type: Date
  },
  
  // Review and Appeals
  reviewDate: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  
  appeals: [{
    appealDate: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String
  }],
  
  // Impact and Scope
  scope: {
    type: String,
    enum: ['company_specific', 'industry_wide', 'platform_wide'],
    default: 'company_specific'
  },
  
  affectedCompanies: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    impactDate: {
      type: Date,
      default: Date.now
    },
    notes: String
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is expired
blacklistSchema.virtual('isExpired').get(function() {
  if (this.duration === 0) return false; // Permanent blacklist
  return this.expiryDate && new Date() > this.expiryDate;
});

// Virtual for days until expiry
blacklistSchema.virtual('daysUntilExpiry').get(function() {
  if (this.duration === 0 || !this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is active
blacklistSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Virtual for has pending appeal
blacklistSchema.virtual('hasPendingAppeal').get(function() {
  return this.appeals.some(appeal => appeal.status === 'pending');
});

// Indexes
blacklistSchema.index({ entity: 1 });
blacklistSchema.index({ entityType: 1 });
blacklistSchema.index({ blacklistedCompany: 1 });
blacklistSchema.index({ status: 1 });
blacklistSchema.index({ category: 1 });
blacklistSchema.index({ severity: 1 });
blacklistSchema.index({ blacklistDate: 1 });
blacklistSchema.index({ expiryDate: 1 });
blacklistSchema.index({ scope: 1 });

// Pre-save middleware to update timestamps and set expiry
blacklistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set expiry date if duration is specified
  if (this.duration > 0 && !this.expiryDate) {
    this.expiryDate = new Date(Date.now() + this.duration * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance method to add audit log
blacklistSchema.methods.addAuditLog = function(action, description, performedBy, metadata = {}) {
  this.auditLog.push({
    action,
    description,
    performedBy,
    metadata
  });
  return this.save();
};

// Instance method to add appeal
blacklistSchema.methods.addAppeal = function(reason) {
  this.appeals.push({
    reason
  });
  return this.save();
};

// Instance method to review appeal
blacklistSchema.methods.reviewAppeal = function(appealIndex, status, reviewedBy, notes = '') {
  if (this.appeals[appealIndex]) {
    this.appeals[appealIndex].status = status;
    this.appeals[appealIndex].reviewedBy = reviewedBy;
    this.appeals[appealIndex].reviewDate = new Date();
    this.appeals[appealIndex].reviewNotes = notes;
  }
  return this.save();
};

// Instance method to remove from blacklist
blacklistSchema.methods.removeFromBlacklist = function(removedBy, reason = '') {
  this.status = 'removed';
  this.addAuditLog('removed', reason, removedBy);
  return this.save();
};

// Instance method to extend blacklist
blacklistSchema.methods.extend = function(additionalDays, extendedBy, reason = '') {
  if (this.expiryDate) {
    this.expiryDate = new Date(this.expiryDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);
  } else if (this.duration > 0) {
    this.expiryDate = new Date(Date.now() + (this.duration + additionalDays) * 24 * 60 * 60 * 1000);
  }
  this.addAuditLog('extended', reason, extendedBy, { additionalDays });
  return this.save();
};

// Static method to check if entity is blacklisted
blacklistSchema.statics.isBlacklisted = async function(entityId, entityType, companyId = null) {
  const query = {
    entity: entityId,
    entityType,
    status: 'active'
  };
  
  if (companyId) {
    query.$or = [
      { scope: 'platform_wide' },
      { scope: 'company_specific', blacklistedCompany: companyId },
      { 'affectedCompanies.company': companyId }
    ];
  }
  
  const blacklist = await this.findOne(query);
  return blacklist && !blacklist.isExpired;
};

module.exports = mongoose.model('Blacklist', blacklistSchema); 