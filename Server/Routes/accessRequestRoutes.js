const express = require('express');
const router = express.Router();

// Import models
const AccessRequest = require('../Modals/AccessRequest');
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole 
} = require('../Middlewares/auth');
const { 
  validateAccessRequestCreation 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { SESService, emailTemplates } = require('../Services/awsService');
const NotificationService = require('../Services/notificationService');

// @route   GET /api/access-requests
// @desc    Get access requests with filtering
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    requestType, 
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (requestType) query.requestType = requestType;
  
  if (search) {
    query.$or = [
      { 'requester.firstName': { $regex: search, $options: 'i' } },
      { 'requester.lastName': { $regex: search, $options: 'i' } },
      { 'requester.email': { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const accessRequests = await AccessRequest.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('requester', 'firstName lastName email phone role')
    .populate('company', 'name')
    .populate('reviewedBy', 'firstName lastName email');

  const total = await AccessRequest.countDocuments(query);

  sendSuccessResponse(res, {
    accessRequests,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/access-requests/:id
// @desc    Get access request by ID
// @access  Private/Admin
router.get('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const accessRequest = await AccessRequest.findById(req.params.id)
    .populate('requester', 'firstName lastName email phone role status')
            .populate('company', 'name')
    .populate('reviewedBy', 'firstName lastName email');

  if (!accessRequest) {
    return sendErrorResponse(res, 404, 'Access request not found');
  }

  sendSuccessResponse(res, { accessRequest });
}));

// @route   POST /api/access-requests
// @desc    Create a new access request
// @access  Public
router.post('/', validateAccessRequestCreation, asyncHandler(async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    companyName, 
    companyEmail, 
    requestType, 
    reason, 
    additionalInfo 
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendErrorResponse(res, 400, 'User with this email already exists');
  }

  // Check if access request already exists for this email
  const existingRequest = await AccessRequest.findOne({ 
    'requester.email': email,
    status: { $in: ['pending', 'approved'] }
  });
  if (existingRequest) {
    return sendErrorResponse(res, 400, 'Access request already exists for this email');
  }

  // Create or find company
  let company = null;
  if (companyName) {
    company = await Company.findOne({ name: companyName });
    if (!company) {
      company = await Company.create({
        name: companyName,
        status: 'pending'
      });
    }
  }

  const requestData = {
    requester: {
      firstName,
      lastName,
      email,
      phone
    },
    company: company?._id,
    requestType,
    reason,
    additionalInfo,
    status: 'pending'
  };

  const accessRequest = await AccessRequest.create(requestData);

  // Populate the created request
  const populatedRequest = await AccessRequest.findById(accessRequest._id)
    .populate('company', 'name');

  // Create audit log
  await AuditLog.create({
    user: null, // Public request
    action: 'access_request_create',
    resource: {
      type: 'access_request',
      id: accessRequest._id,
      name: `${firstName} ${lastName} - ${requestType}`
    },
    details: {
      description: `New access request created: ${firstName} ${lastName} (${email})`,
      category: 'access_management',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Send confirmation email to requester
  try {
    await SESService.sendEmail(
      email,
      'Access Request Received',
      emailTemplates.accessRequestReceived.html({
        firstName: firstName,
        requestType: requestType,
        companyName: companyName || 'N/A'
      })
    );
  } catch (emailError) {
    console.error('Failed to send access request confirmation email:', emailError);
  }

  // Send notification to admins
  try {
    const adminUsers = await User.find({ role: 'Admin', status: 'active' });
    const adminIds = adminUsers.map(admin => admin._id);
    
    await NotificationService.sendAccessRequestNotification(adminIds, {
      _id: accessRequest._id,
      requester: {
        firstName,
        lastName,
        email
      },
      requestType,
      company: company
    });
  } catch (notificationError) {
    console.error('Failed to send access request notification:', notificationError);
  }

  sendSuccessResponse(res, { accessRequest: populatedRequest }, 'Access request submitted successfully', 201);
}));

// @route   PUT /api/access-requests/:id/approve
// @desc    Approve access request
// @access  Private/Admin
router.put('/:id/approve', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { notes, role, employeeId, designation, department } = req.body;

  const accessRequest = await AccessRequest.findById(req.params.id);
  if (!accessRequest) {
    return sendErrorResponse(res, 404, 'Access request not found');
  }

  if (accessRequest.status !== 'pending') {
    return sendErrorResponse(res, 400, 'Access request is not pending');
  }

  // Create user account
  const userData = {
    firstName: accessRequest.requester.firstName,
    lastName: accessRequest.requester.lastName,
    email: accessRequest.requester.email,
    phone: accessRequest.requester.phone,
    role: role || accessRequest.requestType,
    status: 'active',
    company: accessRequest.company
  };

  // Add employee-specific fields
  if (role === 'Employee' || accessRequest.requestType === 'Employee') {
    if (employeeId) userData.employeeId = employeeId;
    if (designation) userData.designation = designation;
    if (department) userData.department = department;
    userData.joiningDate = new Date();
  }

  const user = await User.create(userData);

  // Update access request
  accessRequest.status = 'approved';
  accessRequest.reviewedBy = req.user._id;
  accessRequest.reviewedAt = new Date();
  accessRequest.reviewNotes = notes;
  accessRequest.approvedUser = user._id;
  await accessRequest.save();

  // Update company status if it was pending
  if (accessRequest.company) {
    const company = await Company.findById(accessRequest.company);
    if (company && company.status === 'pending') {
      company.status = 'active';
      await company.save();
    }
  }

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'access_request_approve',
    resource: {
      type: 'access_request',
      id: accessRequest._id,
      name: `${accessRequest.requester.firstName} ${accessRequest.requester.lastName}`
    },
    details: {
      description: `Access request approved: ${accessRequest.requester.firstName} ${accessRequest.requester.lastName}`,
      category: 'access_management',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  // Send approval email to requester
  try {
    await SESService.sendEmail(
      accessRequest.requester.email,
      'Access Request Approved',
      emailTemplates.accessRequestApproved.html({
        firstName: accessRequest.requester.firstName,
        role: user.role,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      })
    );
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }

  sendSuccessResponse(res, { 
    accessRequest, 
    user: { 
      _id: user._id, 
      email: user.email, 
      role: user.role 
    } 
  }, 'Access request approved successfully');
}));

// @route   PUT /api/access-requests/:id/deny
// @desc    Deny access request
// @access  Private/Admin
router.put('/:id/deny', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return sendErrorResponse(res, 400, 'Denial reason is required');
  }

  const accessRequest = await AccessRequest.findById(req.params.id);
  if (!accessRequest) {
    return sendErrorResponse(res, 404, 'Access request not found');
  }

  if (accessRequest.status !== 'pending') {
    return sendErrorResponse(res, 400, 'Access request is not pending');
  }

  // Update access request
  accessRequest.status = 'denied';
  accessRequest.reviewedBy = req.user._id;
  accessRequest.reviewedAt = new Date();
  accessRequest.reviewNotes = reason;
  await accessRequest.save();

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'access_request_deny',
    resource: {
      type: 'access_request',
      id: accessRequest._id,
      name: `${accessRequest.requester.firstName} ${accessRequest.requester.lastName}`
    },
    details: {
      description: `Access request denied: ${accessRequest.requester.firstName} ${accessRequest.requester.lastName}`,
      category: 'access_management',
      severity: 'medium',
      ipAddress: req.ip,
      reason: reason
    }
  });

  // Send denial email to requester
  try {
    await SESService.sendEmail(
      accessRequest.requester.email,
      'Access Request Update',
      emailTemplates.accessRequestDenied.html({
        firstName: accessRequest.requester.firstName,
        reason: reason
      })
    );
  } catch (emailError) {
    console.error('Failed to send denial email:', emailError);
  }

  sendSuccessResponse(res, { accessRequest }, 'Access request denied successfully');
}));

// @route   GET /api/access-requests/statistics
// @desc    Get access request statistics
// @access  Private/Admin
router.get('/statistics/overview', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const [
    totalRequests,
    pendingRequests,
    approvedRequests,
    deniedRequests,
    employerRequests,
    employeeRequests,
    verifierRequests
  ] = await Promise.all([
    AccessRequest.countDocuments({}),
    AccessRequest.countDocuments({ status: 'pending' }),
    AccessRequest.countDocuments({ status: 'approved' }),
    AccessRequest.countDocuments({ status: 'denied' }),
    AccessRequest.countDocuments({ requestType: 'Employer' }),
    AccessRequest.countDocuments({ requestType: 'Employee' }),
    AccessRequest.countDocuments({ requestType: 'Verifier' })
  ]);

  const statistics = {
    total: totalRequests,
    pending: pendingRequests,
    approved: approvedRequests,
    denied: deniedRequests,
    byType: {
      employer: employerRequests,
      employee: employeeRequests,
      verifier: verifierRequests
    },
    approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0,
    denialRate: totalRequests > 0 ? ((deniedRequests / totalRequests) * 100).toFixed(2) : 0
  };

  sendSuccessResponse(res, { statistics });
}));

// @route   GET /api/access-requests/recent
// @desc    Get recent access requests
// @access  Private/Admin
router.get('/recent', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const recentRequests = await AccessRequest.find({})
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('requester', 'firstName lastName email')
    .populate('company', 'name')
    .populate('reviewedBy', 'firstName lastName');

  sendSuccessResponse(res, { recentRequests });
}));

module.exports = router; 