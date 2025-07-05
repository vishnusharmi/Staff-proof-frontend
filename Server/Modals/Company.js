const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Optional Company Information
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  
  // Required Business Identifiers
  pan: {
    type: String,
    required: [true, 'PAN is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
  },
  gst: {
    type: String,
    required: [true, 'GST is required'],
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9A-Z]{1}$/, 'Invalid GST format']
  },
  cin: {
    type: String,
    required: [true, 'CIN is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, 'Invalid CIN format']
  },
  
  // Required Authorized Person Information
  authorizedPersonName: {
    type: String,
    required: [true, 'Authorized person name is required'],
    trim: true
  },
  authorizedPersonEmail: {
    type: String,
    required: [true, 'Authorized person email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  authorizedPersonContact: {
    type: String,
    required: [true, 'Authorized person contact is required'],
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Documents
  documents: {
    panCertificate: String,
    gstCertificate: String,
    cinCertificate: String,
    otherDocuments: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Status and Verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Subscription and Billing
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: [{
      name: String,
      limit: Number,
      used: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Settings and Preferences
  settings: {
    allowEmployeeSelfRegistration: {
      type: Boolean,
      default: false
    },
    requireApprovalForAccess: {
      type: Boolean,
      default: true
    },
    autoVerifyEmployees: {
      type: Boolean,
      default: false
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Statistics
  stats: {
    totalEmployees: {
      type: Number,
      default: 0
    },
    verifiedEmployees: {
      type: Number,
      default: 0
    },
    pendingVerifications: {
      type: Number,
      default: 0
    },
    totalAccessRequests: {
      type: Number,
      default: 0
    },
    successfulAccessRequests: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for verification status
companySchema.virtual('verificationStatus').get(function() {
  if (this.isVerified) return 'verified';
  if (this.status === 'suspended') return 'suspended';
  if (this.status === 'pending') return 'pending';
  return 'inactive';
});

// Indexes
companySchema.index({ pan: 1 });
companySchema.index({ gst: 1 });
companySchema.index({ cin: 1 });
companySchema.index({ status: 1 });
companySchema.index({ email: 1 });
companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });

module.exports = mongoose.model('Company', companySchema); 