const mongoose = require('mongoose');

const verificationCaseSchema = new mongoose.Schema({
  // Case Information
  caseId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'SP_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Company Information
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Assignment Information
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status !== 'pending';
    }
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Case Status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'verified', 'flagged', 'rejected', 'completed'],
    default: 'pending'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Documents Required and Status
  requiredDocuments: {
    resume: {
      isRequired: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'flagged', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    governmentId: {
      isRequired: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'flagged', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    payslips: {
      isRequired: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'flagged', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    experienceLetters: {
      isRequired: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'flagged', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    educationalCertificates: {
      isRequired: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'flagged', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }
  },
  
  // Verification Results
  verificationResults: {
    overallStatus: {
      type: String,
      enum: ['pending', 'verified', 'flagged', 'rejected'],
      default: 'pending'
    },
    finalDecision: {
      type: String,
      enum: ['approved', 'rejected', 'needs_clarification'],
      default: 'pending'
    },
    decisionDate: Date,
    decisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decisionNotes: String,
    tags: [String]
  },
  
  // Notes and Communication
  notes: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  
  // Activity Log
  activityLog: [{
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
  
  // Clarification Requests
  clarificationRequests: [{
    request: {
      type: String,
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    response: String,
    respondedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'responded', 'closed'],
      default: 'pending'
    }
  }],
  
  // Timestamps
  startedAt: Date,
  completedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
verificationCaseSchema.virtual('progressPercentage').get(function() {
  const documents = Object.values(this.requiredDocuments);
  const submittedCount = documents.filter(doc => 
    doc.status === 'submitted' || doc.status === 'verified' || doc.status === 'flagged'
  ).length;
  const totalRequired = documents.filter(doc => doc.isRequired).length;
  return totalRequired > 0 ? Math.round((submittedCount / totalRequired) * 100) : 0;
});

// Virtual for is overdue
verificationCaseSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== 'completed';
});

// Virtual for days remaining
verificationCaseSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes
verificationCaseSchema.index({ employee: 1 });
verificationCaseSchema.index({ company: 1 });
verificationCaseSchema.index({ assignedTo: 1 });
verificationCaseSchema.index({ status: 1 });
verificationCaseSchema.index({ priority: 1 });
verificationCaseSchema.index({ dueDate: 1 });
verificationCaseSchema.index({ 'verificationResults.overallStatus': 1 });

// Pre-save middleware to update lastUpdated
verificationCaseSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Instance method to add activity log
verificationCaseSchema.methods.addActivity = function(action, description, performedBy, metadata = {}) {
  this.activityLog.push({
    action,
    description,
    performedBy,
    metadata
  });
  return this.save();
};

// Instance method to add note
verificationCaseSchema.methods.addNote = function(content, author, isInternal = false) {
  this.notes.push({
    content,
    author,
    isInternal
  });
  return this.save();
};

// Instance method to update document status
verificationCaseSchema.methods.updateDocumentStatus = function(documentType, status, verifiedBy = null, notes = '') {
  if (this.requiredDocuments[documentType]) {
    this.requiredDocuments[documentType].status = status;
    if (verifiedBy) {
      this.requiredDocuments[documentType].verifiedBy = verifiedBy;
      this.requiredDocuments[documentType].verifiedAt = new Date();
    }
    if (notes) {
      this.requiredDocuments[documentType].notes = notes;
    }
  }
  return this.save();
};

module.exports = mongoose.model('VerificationCase', verificationCaseSchema); 