const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  // Billing Information
  billingId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'BILL_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Company Information
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Subscription Information
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    features: [{
      name: String,
      limit: Number,
      used: {
        type: Number,
        default: 0
      },
      overageRate: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
      required: true
    },
    transactionId: String,
    gateway: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay', 'other']
    },
    gatewayResponse: mongoose.Schema.Types.Mixed,
    paidAt: Date,
    dueDate: {
      type: Date,
      required: true
    }
  },
  
  // Billing Details
  billingDetails: {
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    lastBillingDate: Date,
    proratedAmount: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  
  // Invoice Information
  invoice: {
    number: {
      type: String,
      unique: true,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    },
    sentAt: Date,
    paidAt: Date,
    dueDate: {
      type: Date,
      required: true
    },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }]
  },
  
  // Usage Tracking
  usage: {
    employeeLookups: {
      limit: Number,
      used: {
        type: Number,
        default: 0
      },
      overage: {
        type: Number,
        default: 0
      }
    },
    documentVerifications: {
      limit: Number,
      used: {
        type: Number,
        default: 0
      },
      overage: {
        type: Number,
        default: 0
      }
    },
    accessRequests: {
      limit: Number,
      used: {
        type: Number,
        default: 0
      },
      overage: {
        type: Number,
        default: 0
      }
    },
    storage: {
      limit: Number, // in MB
      used: {
        type: Number,
        default: 0
      },
      overage: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['payment_due', 'payment_overdue', 'payment_received', 'subscription_expiring', 'usage_limit_reached'],
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
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
      ref: 'User'
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

// Virtual for is overdue
billingSchema.virtual('isOverdue').get(function() {
  return this.payment.status === 'pending' && new Date() > this.payment.dueDate;
});

// Virtual for days until due
billingSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.payment.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for subscription status
billingSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.isActive) return 'inactive';
  if (new Date() > this.subscription.endDate) return 'expired';
  if (this.isOverdue) return 'overdue';
  return 'active';
});

// Virtual for usage percentage
billingSchema.virtual('usagePercentage').get(function() {
  const totalLimit = this.usage.employeeLookups.limit + 
                    this.usage.documentVerifications.limit + 
                    this.usage.accessRequests.limit;
  const totalUsed = this.usage.employeeLookups.used + 
                   this.usage.documentVerifications.used + 
                   this.usage.accessRequests.used;
  return totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;
});

// Indexes
billingSchema.index({ company: 1 });
billingSchema.index({ 'payment.status': 1 });
billingSchema.index({ 'payment.dueDate': 1 });
billingSchema.index({ 'subscription.isActive': 1 });
billingSchema.index({ 'subscription.endDate': 1 });
billingSchema.index({ 'invoice.status': 1 });
billingSchema.index({ createdAt: 1 });

// Pre-save middleware to update timestamps
billingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate total amount
  if (this.billingDetails) {
    this.billingDetails.totalAmount = this.payment.amount + 
                                     this.billingDetails.tax - 
                                     this.billingDetails.discount;
  }
  
  next();
});

// Instance method to add audit log
billingSchema.methods.addAuditLog = function(action, description, performedBy, metadata = {}) {
  this.auditLog.push({
    action,
    description,
    performedBy,
    metadata
  });
  return this.save();
};

// Instance method to update payment status
billingSchema.methods.updatePaymentStatus = function(status, transactionId = null, gatewayResponse = null) {
  this.payment.status = status;
  if (transactionId) this.payment.transactionId = transactionId;
  if (gatewayResponse) this.payment.gatewayResponse = gatewayResponse;
  if (status === 'completed') {
    this.payment.paidAt = new Date();
    this.invoice.status = 'paid';
    this.invoice.paidAt = new Date();
  }
  return this.save();
};

// Instance method to update usage
billingSchema.methods.updateUsage = function(type, amount) {
  if (this.usage[type]) {
    this.usage[type].used += amount;
    if (this.usage[type].limit && this.usage[type].used > this.usage[type].limit) {
      this.usage[type].overage = this.usage[type].used - this.usage[type].limit;
    }
  }
  return this.save();
};

// Instance method to renew subscription
billingSchema.methods.renewSubscription = function(newEndDate, amount) {
  this.subscription.endDate = newEndDate;
  this.payment.amount = amount;
  this.payment.status = 'pending';
  this.payment.dueDate = new Date();
  this.invoice.status = 'draft';
  this.invoice.dueDate = new Date();
  return this.save();
};

// Static method to get overdue bills
billingSchema.statics.getOverdueBills = function() {
  return this.find({
    'payment.status': 'pending',
    'payment.dueDate': { $lt: new Date() }
  });
};

// Static method to get expiring subscriptions
billingSchema.statics.getExpiringSubscriptions = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    'subscription.isActive': true,
    'subscription.endDate': { $lte: expiryDate, $gt: new Date() }
  });
};

module.exports = mongoose.model('Billing', billingSchema); 