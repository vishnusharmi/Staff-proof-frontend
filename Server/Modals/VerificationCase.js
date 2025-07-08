const mongoose = require('mongoose');

const verificationCaseSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Case Information
  caseType: {
    type: String,
    enum: ['profile_update', 'job_history', 'document_verification'],
    required: true
  },
  
  // Profile Status
  profileStatus: {
    type: String,
    enum: ['updated', 'pending', 'verified', 'rejected'],
    default: 'updated'
  },
  
  // Job History Status
  jobHistoryStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Document Status
  documentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Overall Case Status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  
  // Assignment Information
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Verification Details
  verificationNotes: {
    type: String
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Case History
  history: [{
    action: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    previousStatus: {
      type: String
    },
    newStatus: {
      type: String
    }
  }],
  
  // Document Verification Details
  documentVerifications: [{
    documentType: {
      type: String,
      enum: ['offerLetter', 'relievingLetter', 'payslips', 'bankStatements', 'resume', 'certificates', 'aadharCard', 'panCard'],
      required: true
    },
    jobHistoryIndex: {
      type: Number,
      default: -1 // -1 for profile documents, >= 0 for job history documents
    },
    documentIndex: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    notes: {
      type: String
    }
  }],
  
  // Job History Verification Details
  jobHistoryVerifications: [{
    jobHistoryIndex: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    notes: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
verificationCaseSchema.index({ employee: 1, status: 1 });
verificationCaseSchema.index({ assignedTo: 1, status: 1 });
verificationCaseSchema.index({ createdAt: -1 });
verificationCaseSchema.index({ priority: 1, status: 1 });

// Pre-save middleware to update updatedAt
verificationCaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add history entry
verificationCaseSchema.methods.addHistoryEntry = function(action, description, performedBy, previousStatus = null, newStatus = null) {
  this.history.push({
    action,
    description,
    performedBy,
    previousStatus,
    newStatus
  });
  return this.save();
};

// Method to update case status
verificationCaseSchema.methods.updateStatus = function(newStatus, performedBy, notes = '') {
  const previousStatus = this.status;
  this.status = newStatus;
  this.verificationNotes = notes;
  
  if (newStatus === 'completed' || newStatus === 'rejected') {
    this.verificationDate = new Date();
    this.verifiedBy = performedBy;
  }
  
  return this.addHistoryEntry(
    'status_update',
    `Case status changed from ${previousStatus} to ${newStatus}`,
    performedBy,
    previousStatus,
    newStatus
  );
};

// Method to assign case
verificationCaseSchema.methods.assignCase = function(verifierId, assignedBy) {
  this.assignedTo = verifierId;
  this.assignedAt = new Date();
  this.assignedBy = assignedBy;
  this.status = 'assigned';
  
  return this.addHistoryEntry(
    'case_assigned',
    'Case assigned to verifier',
    assignedBy,
    'pending',
    'assigned'
  );
};

// Method to update document verification status
verificationCaseSchema.methods.updateDocumentVerification = function(documentType, jobHistoryIndex, documentIndex, status, verifiedBy, notes = '') {
  const existingVerification = this.documentVerifications.find(
    v => v.documentType === documentType && 
         v.jobHistoryIndex === jobHistoryIndex && 
         v.documentIndex === documentIndex
  );
  
  if (existingVerification) {
    existingVerification.status = status;
    existingVerification.verifiedBy = verifiedBy;
    existingVerification.verifiedAt = new Date();
    existingVerification.notes = notes;
  } else {
    this.documentVerifications.push({
      documentType,
      jobHistoryIndex,
      documentIndex,
      status,
      verifiedBy,
      verifiedAt: new Date(),
      notes
    });
  }
  
  return this.addHistoryEntry(
    'document_verification',
    `Document ${documentType} ${status}`,
    verifiedBy
  );
};

// Method to update job history verification status
verificationCaseSchema.methods.updateJobHistoryVerification = function(jobHistoryIndex, status, verifiedBy, notes = '') {
  const existingVerification = this.jobHistoryVerifications.find(
    v => v.jobHistoryIndex === jobHistoryIndex
  );
  
  if (existingVerification) {
    existingVerification.status = status;
    existingVerification.verifiedBy = verifiedBy;
    existingVerification.verifiedAt = new Date();
    existingVerification.notes = notes;
  } else {
    this.jobHistoryVerifications.push({
      jobHistoryIndex,
      status,
      verifiedBy,
      verifiedAt: new Date(),
      notes
    });
  }
  
  return this.addHistoryEntry(
    'job_history_verification',
    `Job history ${jobHistoryIndex} ${status}`,
    verifiedBy
  );
};

module.exports = mongoose.model('VerificationCase', verificationCaseSchema); 