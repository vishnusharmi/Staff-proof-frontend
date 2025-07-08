const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const VerificationCase = require('../Modals/VerificationCase');
const User = require('../Modals/User');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { authenticateToken, authorizeRole } = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/verification/cases
// @desc    Get all verification cases (for super admin)
// @access  Private (Admin only)
router.get('/cases', authenticateToken, authorizeRole('Admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, search } = req.query;
  
  // Build query
  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { 'employee.firstName': { $regex: search, $options: 'i' } },
      { 'employee.lastName': { $regex: search, $options: 'i' } },
      { 'employee.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const cases = await VerificationCase.find(query)
    .populate('employee', 'firstName lastName email staffProofId')
    .populate('assignedTo', 'firstName lastName')
    .populate('assignedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await VerificationCase.countDocuments(query);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);

  sendSuccessResponse(res, {
    cases,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      total,
      limit: parseInt(limit)
    }
  }, 'Verification cases retrieved successfully');
}));

// @route   GET /api/verification/cases/:id
// @desc    Get verification case by ID
// @access  Private (Admin, assigned verifier)
router.get('/cases/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const verificationCase = await VerificationCase.findById(id)
    .populate('employee', 'firstName lastName email staffProofId profileStatus jobHistory documents')
    .populate('assignedTo', 'firstName lastName')
    .populate('assignedBy', 'firstName lastName')
    .populate('verifiedBy', 'firstName lastName');

  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Check if user can access this case
  if (req.user.role !== 'Admin' && 
      verificationCase.assignedTo?.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  sendSuccessResponse(res, { case: verificationCase }, 'Verification case retrieved successfully');
}));

// @route   POST /api/verification/cases/:id/assign
// @desc    Assign verification case to verifier
// @access  Private (Admin only)
router.post('/cases/:id/assign', authenticateToken, authorizeRole('Admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verifierId } = req.body;
  
  if (!verifierId) {
    return sendErrorResponse(res, 400, 'Verifier ID is required');
  }

  // Check if verifier exists and has verifier role
  const verifier = await User.findById(verifierId);
  if (!verifier || verifier.role !== 'Verifier') {
    return sendErrorResponse(res, 400, 'Invalid verifier');
  }
  
  const verificationCase = await VerificationCase.findById(id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Assign case
  await verificationCase.assignCase(verifierId, req.user._id);

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'case_assignment',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase._id}`
    },
    details: {
      description: `Case assigned to verifier: ${verifier.firstName} ${verifier.lastName}`,
      category: 'case_management',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
  
  sendSuccessResponse(res, { case: verificationCase }, 'Case assigned successfully');
}));

// @route   PUT /api/verification/cases/:id/status
// @desc    Update verification case status
// @access  Private (Assigned verifier, Admin)
router.put('/cases/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const verificationCase = await VerificationCase.findById(id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Check if user can update this case
  if (req.user.role !== 'Admin' && 
      verificationCase.assignedTo?.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  // Update case status
  await verificationCase.updateStatus(status, req.user._id, notes);
  
  // Update user verification status if case is completed
  if (status === 'completed') {
    const user = await User.findById(verificationCase.employee);
    if (user) {
      if (verificationCase.caseType === 'profile_update') {
        user.profileStatus = 'verified';
        user.profileStatusUpdatedAt = new Date();
        user.profileStatusUpdatedBy = req.user._id;
      }
      await user.save();
    }
  } else if (status === 'in_progress') {
    // When verifier starts reviewing, change status from 'updated' to 'pending'
    const user = await User.findById(verificationCase.employee);
    if (user && user.profileStatus === 'updated') {
      user.profileStatus = 'pending';
      user.profileStatusUpdatedAt = new Date();
      user.profileStatusUpdatedBy = req.user._id;
      await user.save();
    }
  }
  
  sendSuccessResponse(res, { case: verificationCase }, 'Case status updated successfully');
}));

// @route   PUT /api/verification/cases/:id/document/:documentType/:jobHistoryIndex/:documentIndex
// @desc    Update document verification status
// @access  Private (Assigned verifier)
router.put('/cases/:id/document/:documentType/:jobHistoryIndex/:documentIndex', authenticateToken, asyncHandler(async (req, res) => {
  const { id, documentType, jobHistoryIndex, documentIndex } = req.params;
  const { status, notes } = req.body;
  
  const verificationCase = await VerificationCase.findById(id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Check if user can update this case
  if (req.user.role !== 'Admin' && 
      verificationCase.assignedTo?.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  // Update document verification status
  await verificationCase.updateDocumentVerification(
    documentType,
    parseInt(jobHistoryIndex),
    parseInt(documentIndex),
    status,
    req.user._id,
    notes
  );
  
  // Update user document verification status
  const user = await User.findById(verificationCase.employee);
  if (user) {
    if (jobHistoryIndex === '-1') {
      // Profile documents
      if (user.documents[documentType] && user.documents[documentType][documentIndex]) {
        user.documents[documentType][documentIndex].verificationStatus = status;
        user.documents[documentType][documentIndex].verifiedBy = req.user._id;
        user.documents[documentType][documentIndex].verifiedAt = new Date();
        if (notes) {
          user.documents[documentType][documentIndex].verificationNotes = notes;
        }
      }
    } else {
      // Job history documents
      if (user.jobHistory[jobHistoryIndex] && 
          user.jobHistory[jobHistoryIndex].documents[documentType] &&
          user.jobHistory[jobHistoryIndex].documents[documentType][documentIndex]) {
        user.jobHistory[jobHistoryIndex].documents[documentType][documentIndex].verificationStatus = status;
        user.jobHistory[jobHistoryIndex].documents[documentType][documentIndex].verifiedBy = req.user._id;
        user.jobHistory[jobHistoryIndex].documents[documentType][documentIndex].verifiedAt = new Date();
        if (notes) {
          user.jobHistory[jobHistoryIndex].documents[documentType][documentIndex].verificationNotes = notes;
        }
      }
    }
    await user.save();
  }
  
  sendSuccessResponse(res, { case: verificationCase }, 'Document verification status updated successfully');
}));

// @route   PUT /api/verification/cases/:id/job-history/:jobHistoryIndex
// @desc    Update job history verification status
// @access  Private (Assigned verifier)
router.put('/cases/:id/job-history/:jobHistoryIndex', authenticateToken, asyncHandler(async (req, res) => {
  const { id, jobHistoryIndex } = req.params;
  const { status, notes } = req.body;
  
  const verificationCase = await VerificationCase.findById(id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Check if user can update this case
  if (req.user.role !== 'Admin' && 
      verificationCase.assignedTo?.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  // Update job history verification status
  await verificationCase.updateJobHistoryVerification(
    parseInt(jobHistoryIndex),
    status,
    req.user._id,
    notes
  );
  
  // Update user job history verification status
  const user = await User.findById(verificationCase.employee);
  if (user && user.jobHistory[jobHistoryIndex]) {
    user.jobHistory[jobHistoryIndex].verificationStatus = status;
    user.jobHistory[jobHistoryIndex].verifiedBy = req.user._id;
    user.jobHistory[jobHistoryIndex].verifiedAt = new Date();
  if (notes) {
      user.jobHistory[jobHistoryIndex].verificationNotes = notes;
    }
    await user.save();
  }
  
  sendSuccessResponse(res, { case: verificationCase }, 'Job history verification status updated successfully');
}));

// @route   GET /api/verification/verifier/cases
// @desc    Get verification cases assigned to verifier
// @access  Private (Verifier)
router.get('/verifier/cases', authenticateToken, authorizeRole('Verifier'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  // Build query
  const query = { assignedTo: req.user._id };
  if (status) query.status = status;
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const cases = await VerificationCase.find(query)
    .populate('employee', 'firstName lastName email staffProofId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await VerificationCase.countDocuments(query);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  
  sendSuccessResponse(res, {
    cases,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      total,
      limit: parseInt(limit)
    }
  }, 'Verification cases retrieved successfully');
}));

// @route   GET /api/verification/verifiers
// @desc    Get all verifiers (for admin assignment)
// @access  Private (Admin only)
router.get('/verifiers', authenticateToken, authorizeRole('Admin'), asyncHandler(async (req, res) => {
  const verifiers = await User.find({ role: 'Verifier', status: 'active' })
    .select('firstName lastName email')
    .sort({ firstName: 1 });
  
  sendSuccessResponse(res, { verifiers }, 'Verifiers retrieved successfully');
}));

module.exports = router; 