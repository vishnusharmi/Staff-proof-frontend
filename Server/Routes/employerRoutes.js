const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../Middlewares/auth');
const { asyncHandler } = require('../Middlewares/errorHandler');
const { sendSuccessResponse, sendErrorResponse } = require('../Services/OneServices');
const User = require('../Modals/User');
const Company = require('../Modals/Company');

// @route   GET /api/employers
// @desc    Get all employers with pagination and filters
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', kycStatus = '' } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  let query = { role: 'Employer' };
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (kycStatus) {
    query.kycStatus = kycStatus;
  }

  // Get employers with company info
  const employers = await User.find(query)
    .populate('company', 'name')
    .select('firstName lastName email createdAt kycStatus company')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Transform data to match frontend expectations
  const transformedEmployers = employers.map(emp => ({
    id: emp._id,
    name: emp.company?.name || 'Unknown Company',
    email: emp.email,
    registration_date: emp.createdAt,
    kyc_status: emp.kycStatus || 'Pending'
  }));

  return sendSuccessResponse(res, 200, 'Employers retrieved successfully', {
    data: transformedEmployers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages
    }
  });
}));

// @route   GET /api/employers/:id
// @desc    Get employer details by ID
// @access  Private/Admin
router.get('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employer = await User.findOne({ _id: id, role: 'Employer' })
    .populate('company')
    .select('-password');

  if (!employer) {
    return sendErrorResponse(res, 404, 'Employer not found');
  }

  // Get additional stats
  const employeeCount = await User.countDocuments({ 
    company: employer.company?._id, 
    role: 'Employee' 
  });

  const VerificationCase = require('../Modals/VerificationCase');
  const verificationCount = await VerificationCase.countDocuments({
    company: employer.company?._id
  });

  const Billing = require('../Modals/Billing');
  const billingCount = await Billing.countDocuments({
    userId: employer._id
  });

  const employerData = {
    ...employer.toObject(),
    stats: {
      employeeCount,
      verificationCount,
      billingCount
    }
  };

  return sendSuccessResponse(res, 200, 'Employer details retrieved successfully', employerData);
}));

// @route   PUT /api/employers/:id/kyc
// @desc    Update employer KYC status
// @access  Private/Admin
router.put('/:id/kyc', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { kyc_status } = req.body;

  if (!['Pending', 'Verified', 'Rejected'].includes(kyc_status)) {
    return sendErrorResponse(res, 400, 'Invalid KYC status');
  }

  const employer = await User.findOneAndUpdate(
    { _id: id, role: 'Employer' },
    { kycStatus: kyc_status },
    { new: true }
  ).select('-password');

  if (!employer) {
    return sendErrorResponse(res, 404, 'Employer not found');
  }

  // Log the action
  const AuditLog = require('../Modals/AuditLog');
  await AuditLog.create({
    admin: req.user._id,
    action: 'UPDATE_KYC_STATUS',
    details: `Updated KYC status to ${kyc_status} for employer ${employer.firstName} ${employer.lastName}`,
    target_user: employer._id,
    target_type: 'Employer',
    status: 'Success'
  });

  return sendSuccessResponse(res, 200, 'KYC status updated successfully', employer);
}));

// @route   GET /api/employers/:id/employees
// @desc    Get employees for a specific employer
// @access  Private/Admin
router.get('/:id/employees', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const employer = await User.findById(id).populate('company');
  if (!employer || employer.role !== 'Employer') {
    return sendErrorResponse(res, 404, 'Employer not found');
  }

  const employees = await User.find({ 
    company: employer.company?._id, 
    role: 'Employee' 
  })
  .select('firstName lastName middleName email staffProofId employeeId isVerified createdAt')
  .skip(skip)
  .limit(parseInt(limit))
  .sort({ createdAt: -1 });

  const total = await User.countDocuments({ 
    company: employer.company?._id, 
    role: 'Employee' 
  });

  return sendSuccessResponse(res, 200, 'Employees retrieved successfully', {
    data: employees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   GET /api/employers/:id/verifications
// @desc    Get verification cases for a specific employer
// @access  Private/Admin
router.get('/:id/verifications', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status = '' } = req.query;
  const skip = (page - 1) * limit;

  const employer = await User.findById(id).populate('company');
  if (!employer || employer.role !== 'Employer') {
    return sendErrorResponse(res, 404, 'Employer not found');
  }

  let query = { company: employer.company?._id };
  if (status) {
    query.status = status;
  }

  const VerificationCase = require('../Modals/VerificationCase');
  const verifications = await VerificationCase.find(query)
    .populate('employee', 'firstName lastName middleName email staffProofId employeeId')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await VerificationCase.countDocuments(query);

  return sendSuccessResponse(res, 200, 'Verifications retrieved successfully', {
    data: verifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

module.exports = router; 