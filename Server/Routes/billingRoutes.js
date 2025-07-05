const express = require('express');
const router = express.Router();

// Import models
const Billing = require('../Modals/Billing');
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole, 
  authorizeBillingAccess 
} = require('../Middlewares/auth');
const { 
  validateBillingCreation, 
  validatePayment 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { SESService, emailTemplates } = require('../Services/awsService');
const NotificationService = require('../Services/notificationService');

// @route   GET /api/billing/history
// @desc    Get user billing history
// @access  Private
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Mock billing history data - in real app this would come from database
  const mockBillingHistory = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      date: new Date('2024-03-15'),
      description: 'Profile Edit Access',
      amount: 299,
      gst: 53.82,
      total: 352.82,
      status: 'Paid'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      date: new Date('2024-03-20'),
      description: 'Priority Verification',
      amount: 599,
      gst: 107.82,
      total: 706.82,
      status: 'Paid'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      date: new Date('2024-04-01'),
      description: 'Premium Profile Badge',
      amount: 199,
      gst: 35.82,
      total: 234.82,
      status: 'Paid'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2024-004',
      date: new Date('2024-04-10'),
      description: 'Document Backup Service',
      amount: 149,
      gst: 26.82,
      total: 175.82,
      status: 'Paid'
    },
    {
      id: 5,
      invoiceNumber: 'INV-2024-005',
      date: new Date('2024-04-15'),
      description: 'Extended Visibility (3 months)',
      amount: 899,
      gst: 161.82,
      total: 1060.82,
      status: 'Paid'
    }
  ];

  // Apply pagination
  const paginatedHistory = mockBillingHistory.slice(skip, skip + parseInt(limit));

  sendSuccessResponse(res, {
    data: paginatedHistory,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockBillingHistory.length,
      pages: Math.ceil(mockBillingHistory.length / limit)
    }
  });
}));

// @route   GET /api/billing
// @desc    Get billing records with filtering
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    type, 
    company, 
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = {};

  // Role-based filtering
  if (req.user.role === 'Admin') {
    // Admin can see all billing records
  } else if (req.user.role === 'Employer') {
    // Employer can only see their company's billing
    query.company = req.user.company;
  } else if (req.user.role === 'Employee') {
    // Employee can only see their own billing
    query.user = req.user._id;
  }

  if (status) query.status = status;
  if (type) query.type = type;
  if (company) query.company = company;
  
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const billingRecords = await Billing.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  const total = await Billing.countDocuments(query);

  sendSuccessResponse(res, {
    billingRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/billing/:id
// @desc    Get billing record by ID
// @access  Private
router.get('/:id', authenticateToken, authorizeBillingAccess, asyncHandler(async (req, res) => {
  const billingRecord = await Billing.findById(req.params.id)
    .populate('user', 'firstName lastName email phone')
            .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  if (!billingRecord) {
    return sendErrorResponse(res, 404, 'Billing record not found');
  }

  sendSuccessResponse(res, { billingRecord });
}));

// @route   POST /api/billing
// @desc    Create a new billing record
// @access  Private
router.post('/', authenticateToken, authorizeRole(['Admin', 'Employer']), validateBillingCreation, asyncHandler(async (req, res) => {
  const { 
    userId, 
    companyId, 
    type, 
    amount, 
    currency, 
    description, 
    dueDate, 
    items,
    subscriptionPlan 
  } = req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  // Verify company exists if provided
  let company = null;
  if (companyId) {
    company = await Company.findById(companyId);
    if (!company) {
      return sendErrorResponse(res, 404, 'Company not found');
    }
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const billingData = {
    invoiceNumber,
    user: userId,
    company: companyId,
    type: type || 'subscription',
    amount: parseFloat(amount),
    currency: currency || 'USD',
    description,
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    items: items || [],
    subscriptionPlan,
    status: 'pending',
    createdBy: req.user._id
  };

  const billingRecord = await Billing.create(billingData);

  // Populate the created record
  const populatedRecord = await Billing.findById(billingRecord._id)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'billing_create',
    resource: {
      type: 'billing',
      id: billingRecord._id,
      name: `Invoice ${invoiceNumber}`
    },
    details: {
      description: `New billing record created: ${invoiceNumber} for ${user.firstName} ${user.lastName}`,
      category: 'billing',
      severity: 'medium',
      ipAddress: req.ip,
      amount: amount,
      currency: currency
    }
  });

  // Send notification to user
  try {
    await NotificationService.sendBillingNotification(userId, {
      status: 'pending',
      amount: amount,
      invoiceNumber: invoiceNumber,
      _id: billingRecord._id
    });
  } catch (notificationError) {
    console.error('Failed to send billing notification:', notificationError);
  }

  sendSuccessResponse(res, { billingRecord: populatedRecord }, 'Billing record created successfully', 201);
}));

// @route   PUT /api/billing/:id
// @desc    Update billing record
// @access  Private
router.put('/:id', authenticateToken, authorizeBillingAccess, asyncHandler(async (req, res) => {
  const { 
    amount, 
    currency, 
    description, 
    dueDate, 
    items, 
    status,
    notes 
  } = req.body;

  const billingRecord = await Billing.findById(req.params.id);
  if (!billingRecord) {
    return sendErrorResponse(res, 404, 'Billing record not found');
  }

  // Only Admin can change status
  if (status && req.user.role !== 'Admin') {
    return sendErrorResponse(res, 403, 'Only Admin can change billing status');
  }

  const updateData = {};
  if (amount) updateData.amount = parseFloat(amount);
  if (currency) updateData.currency = currency;
  if (description) updateData.description = description;
  if (dueDate) updateData.dueDate = new Date(dueDate);
  if (items) updateData.items = items;
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;

  const updatedRecord = await Billing.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName email')
   .populate('company', 'name')
   .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'billing_update',
    resource: {
      type: 'billing',
      id: billingRecord._id,
      name: `Invoice ${billingRecord.invoiceNumber}`
    },
    details: {
      description: `Billing record updated: ${billingRecord.invoiceNumber}`,
      category: 'billing',
      severity: 'low',
      ipAddress: req.ip,
      changes: Object.keys(updateData)
    }
  });

  sendSuccessResponse(res, { billingRecord: updatedRecord }, 'Billing record updated successfully');
}));

// @route   POST /api/billing/:id/process-payment
// @desc    Process payment for billing record
// @access  Private
router.post('/:id/process-payment', authenticateToken, validatePayment, asyncHandler(async (req, res) => {
  const { 
    paymentMethod, 
    transactionId, 
    paymentAmount, 
    paymentNotes 
  } = req.body;

  const billingRecord = await Billing.findById(req.params.id);
  if (!billingRecord) {
    return sendErrorResponse(res, 404, 'Billing record not found');
  }

  // Check if user has access to this billing record
  if (req.user.role !== 'Admin' && 
      billingRecord.user?.toString() !== req.user._id.toString() &&
      billingRecord.company?.toString() !== req.user.company?.toString()) {
    return sendErrorResponse(res, 403, 'Access denied to this billing record');
  }

  if (billingRecord.status === 'paid') {
    return sendErrorResponse(res, 400, 'Billing record is already paid');
  }

  // Process payment (simulate payment processing)
  const paymentData = {
    paymentMethod,
    transactionId,
    paymentAmount: parseFloat(paymentAmount) || billingRecord.amount,
    paymentDate: new Date(),
    paymentNotes,
    processedBy: req.user._id
  };

  billingRecord.payments.push(paymentData);
  billingRecord.status = 'paid';
  billingRecord.paidAt = new Date();
  await billingRecord.save();

  const updatedRecord = await Billing.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'payment_process',
    resource: {
      type: 'billing',
      id: billingRecord._id,
      name: `Invoice ${billingRecord.invoiceNumber}`
    },
    details: {
      description: `Payment processed for invoice ${billingRecord.invoiceNumber}`,
      category: 'billing',
      severity: 'medium',
      ipAddress: req.ip,
      amount: paymentData.paymentAmount,
      transactionId: transactionId
    }
  });

  // Send payment confirmation notification
  try {
    await NotificationService.sendBillingNotification(billingRecord.user, {
      status: 'paid',
      amount: paymentData.paymentAmount,
      invoiceNumber: billingRecord.invoiceNumber,
      _id: billingRecord._id
    });
  } catch (notificationError) {
    console.error('Failed to send payment notification:', notificationError);
  }

  sendSuccessResponse(res, { billingRecord: updatedRecord }, 'Payment processed successfully');
}));

// @route   POST /api/billing/:id/refund
// @desc    Process refund for billing record
// @access  Private/Admin
router.post('/:id/refund', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    refundAmount, 
    refundReason, 
    refundMethod 
  } = req.body;

  if (!refundAmount || !refundReason) {
    return sendErrorResponse(res, 400, 'Refund amount and reason are required');
  }

  const billingRecord = await Billing.findById(req.params.id);
  if (!billingRecord) {
    return sendErrorResponse(res, 404, 'Billing record not found');
  }

  if (billingRecord.status !== 'paid') {
    return sendErrorResponse(res, 400, 'Billing record is not paid');
  }

  const refundData = {
    refundAmount: parseFloat(refundAmount),
    refundReason,
    refundMethod: refundMethod || 'original_payment_method',
    refundDate: new Date(),
    processedBy: req.user._id
  };

  billingRecord.refunds.push(refundData);
  billingRecord.status = 'refunded';
  billingRecord.refundedAt = new Date();
  await billingRecord.save();

  const updatedRecord = await Billing.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'refund_process',
    resource: {
      type: 'billing',
      id: billingRecord._id,
      name: `Invoice ${billingRecord.invoiceNumber}`
    },
    details: {
      description: `Refund processed for invoice ${billingRecord.invoiceNumber}`,
      category: 'billing',
      severity: 'medium',
      ipAddress: req.ip,
      amount: refundData.refundAmount,
      reason: refundReason
    }
  });

  // Send refund notification email
  try {
    const user = await User.findById(billingRecord.user);
    if (user) {
      await SESService.sendEmail(
        user.email,
        'Refund Processed',
        emailTemplates.refundProcessed.html({
          firstName: user.firstName,
          invoiceNumber: billingRecord.invoiceNumber,
          refundAmount: refundData.refundAmount,
          currency: billingRecord.currency,
          refundReason: refundReason,
          refundDate: refundData.refundDate
        })
      );
    }
  } catch (emailError) {
    console.error('Failed to send refund email:', emailError);
  }

  sendSuccessResponse(res, { billingRecord: updatedRecord }, 'Refund processed successfully');
}));

// @route   GET /api/billing/statistics
// @desc    Get billing statistics
// @access  Private
router.get('/statistics/overview', authenticateToken, asyncHandler(async (req, res) => {
  const query = {};

  // Role-based filtering
  if (req.user.role === 'Employer') {
    query.company = req.user.company;
  } else if (req.user.role === 'Employee') {
    query.user = req.user._id;
  }

  const [
    totalRecords,
    pendingRecords,
    paidRecords,
    overdueRecords,
    refundedRecords,
    totalRevenue,
    totalPending
  ] = await Promise.all([
    Billing.countDocuments(query),
    Billing.countDocuments({ ...query, status: 'pending' }),
    Billing.countDocuments({ ...query, status: 'paid' }),
    Billing.countDocuments({ 
      ...query, 
      status: 'pending', 
      dueDate: { $lt: new Date() } 
    }),
    Billing.countDocuments({ ...query, status: 'refunded' }),
    Billing.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Billing.aggregate([
      { $match: { ...query, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const statistics = {
    total: totalRecords,
    pending: pendingRecords,
    paid: paidRecords,
    overdue: overdueRecords,
    refunded: refundedRecords,
    revenue: totalRevenue[0]?.total || 0,
    pendingAmount: totalPending[0]?.total || 0,
    paymentRate: totalRecords > 0 ? ((paidRecords / totalRecords) * 100).toFixed(2) : 0
  };

  sendSuccessResponse(res, { statistics });
}));

// @route   GET /api/billing/subscriptions
// @desc    Get subscription billing records
// @access  Private
router.get('/subscriptions', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const query = { type: 'subscription' };

  // Role-based filtering
  if (req.user.role === 'Employer') {
    query.company = req.user.company;
  } else if (req.user.role === 'Employee') {
    query.user = req.user._id;
  }

  const subscriptions = await Billing.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name');

  const total = await Billing.countDocuments(query);

  sendSuccessResponse(res, {
    subscriptions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   POST /api/billing/subscriptions/renew
// @desc    Renew subscription
// @access  Private
router.post('/subscriptions/renew', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    subscriptionId, 
    renewalPeriod, 
    autoRenew 
  } = req.body;

  const subscription = await Billing.findById(subscriptionId);
  if (!subscription) {
    return sendErrorResponse(res, 404, 'Subscription not found');
  }

  // Check if user has access to this subscription
  if (req.user.role !== 'Admin' && 
      subscription.user?.toString() !== req.user._id.toString() &&
      subscription.company?.toString() !== req.user.company?.toString()) {
    return sendErrorResponse(res, 403, 'Access denied to this subscription');
  }

  // Create renewal billing record
  const renewalData = {
    user: subscription.user,
    company: subscription.company,
    type: 'subscription',
    amount: subscription.amount,
    currency: subscription.currency,
    description: `Renewal: ${subscription.description}`,
    dueDate: new Date(Date.now() + (renewalPeriod || 30) * 24 * 60 * 60 * 1000),
    subscriptionPlan: subscription.subscriptionPlan,
    status: 'pending',
    createdBy: req.user._id,
    parentSubscription: subscription._id
  };

  const renewalRecord = await Billing.create(renewalData);

  // Update original subscription
  subscription.autoRenew = autoRenew;
  subscription.nextRenewalDate = renewalData.dueDate;
  await subscription.save();

  const populatedRenewal = await Billing.findById(renewalRecord._id)
    .populate('user', 'firstName lastName email')
    .populate('company', 'name');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'subscription_renew',
    resource: {
      type: 'billing',
      id: renewalRecord._id,
      name: `Renewal for ${subscription.invoiceNumber}`
    },
    details: {
      description: `Subscription renewal created`,
      category: 'billing',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, { renewalRecord: populatedRenewal }, 'Subscription renewal created successfully');
}));

module.exports = router; 