const express = require('express');
const router = express.Router();

// Import models
const VerificationCase = require('../Modals/VerificationCase');
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole, 
  authorizeCaseAccess 
} = require('../Middlewares/auth');
const { 
  validateCaseCreation, 
  validateCaseUpdate,
  validateDocumentUpload 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { S3Service, SESService, emailTemplates } = require('../Services/awsService');
const { uploadSingle } = require('../Services/awsService');
const NotificationService = require('../Services/notificationService');

// @route   GET /api/verifications
// @desc    Get verification cases with filtering
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    assignedTo, 
    company, 
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = {};

  // Role-based filtering
  if (req.user.role === 'Admin') {
    // Admin can see all cases
  } else if (req.user.role === 'Employer') {
    // Employer can only see cases from their company
    query.company = req.user.company;
  } else if (req.user.role === 'Employee') {
    // Employee can only see their own cases
    query.employee = req.user._id;
  } else if (req.user.role === 'Verifier') {
    // Verifier can see assigned cases and unassigned cases
    query.$or = [
      { assignedTo: req.user._id },
      { assignedTo: null }
    ];
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (company) query.company = company;
  
  if (search) {
    query.$or = [
      { caseNumber: { $regex: search, $options: 'i' } },
      { 'employee.firstName': { $regex: search, $options: 'i' } },
      { 'employee.lastName': { $regex: search, $options: 'i' } },
      { 'employee.email': { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const cases = await VerificationCase.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('employee', 'firstName lastName email employeeId designation')
    .populate('company', 'name')
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');

  const total = await VerificationCase.countDocuments(query);

  sendSuccessResponse(res, {
    cases,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/verifications/:id
// @desc    Get verification case by ID
// @access  Private
router.get('/:id', authenticateToken, authorizeCaseAccess, asyncHandler(async (req, res) => {
  const verificationCase = await VerificationCase.findById(req.params.id)
    .populate('employee', 'firstName lastName email employeeId designation department')
            .populate('company', 'name')
    .populate('assignedTo', 'firstName lastName email phone')
    .populate('createdBy', 'firstName lastName email')
    .populate('documents.uploadedBy', 'firstName lastName email');

  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  sendSuccessResponse(res, { case: verificationCase });
}));

// @route   POST /api/verifications
// @desc    Create a new verification case
// @access  Private
router.post('/', authenticateToken, authorizeRole(['Admin', 'Employer']), validateCaseCreation, asyncHandler(async (req, res) => {
  const { 
    employeeId, 
    companyId, 
    priority, 
    verificationType, 
    requiredDocuments, 
    notes, 
    dueDate 
  } = req.body;

  // Verify employee exists and belongs to the company
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'Employee') {
    return sendErrorResponse(res, 404, 'Employee not found');
  }

  // Verify company exists
  const company = await Company.findById(companyId);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  // Check if employee belongs to the company
  if (employee.company?.toString() !== companyId) {
    return sendErrorResponse(res, 400, 'Employee does not belong to the specified company');
  }

  // Check if there's already an active case for this employee
  const existingCase = await VerificationCase.findOne({
    employee: employeeId,
    status: { $in: ['pending', 'in_progress', 'under_review'] }
  });

  if (existingCase) {
    return sendErrorResponse(res, 400, 'Employee already has an active verification case');
  }

  // Generate case number
  const caseNumber = `VC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const caseData = {
    caseNumber,
    employee: employeeId,
    company: companyId,
    priority: priority || 'medium',
    verificationType,
    requiredDocuments: requiredDocuments || [],
    notes,
    dueDate,
    status: 'pending',
    createdBy: req.user._id
  };

  const verificationCase = await VerificationCase.create(caseData);

  // Populate the created case
  const populatedCase = await VerificationCase.findById(verificationCase._id)
    .populate('employee', 'firstName lastName email employeeId')
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'verification_case_create',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${caseNumber}`
    },
    details: {
      description: `New verification case created: ${caseNumber} for ${employee.firstName} ${employee.lastName}`,
      category: 'verification',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  // Send notification to employee
  try {
    await NotificationService.sendVerificationNotification(
      employee._id, 
      'pending', 
      verificationCase._id
    );
  } catch (notificationError) {
    console.error('Failed to send verification notification:', notificationError);
  }

  sendSuccessResponse(res, { case: populatedCase }, 'Verification case created successfully', 201);
}));

// @route   PUT /api/verifications/:id
// @desc    Update verification case
// @access  Private
router.put('/:id', authenticateToken, authorizeCaseAccess, validateCaseUpdate, asyncHandler(async (req, res) => {
  const { 
    priority, 
    verificationType, 
    requiredDocuments, 
    notes, 
    dueDate, 
    status,
    assignedTo 
  } = req.body;

  const verificationCase = await VerificationCase.findById(req.params.id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Only Admin and Verifier can change status
  if (status && !['Admin', 'Verifier'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only Admin and Verifier can change case status');
  }

  // Only Admin can assign cases
  if (assignedTo && req.user.role !== 'Admin') {
    return sendErrorResponse(res, 403, 'Only Admin can assign cases');
  }

  // Verify assigned user is a Verifier
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.role !== 'Verifier') {
      return sendErrorResponse(res, 400, 'Assigned user must be a Verifier');
    }
  }

  const updateData = {};
  if (priority) updateData.priority = priority;
  if (verificationType) updateData.verificationType = verificationType;
  if (requiredDocuments) updateData.requiredDocuments = requiredDocuments;
  if (notes) updateData.notes = notes;
  if (dueDate) updateData.dueDate = dueDate;
  if (status) updateData.status = status;
  if (assignedTo) updateData.assignedTo = assignedTo;

  // Update timestamps based on status changes
  if (status === 'in_progress' && verificationCase.status === 'pending') {
    updateData.startedAt = new Date();
  }
  if (status === 'completed' && verificationCase.status !== 'completed') {
    updateData.completedAt = new Date();
  }

  const updatedCase = await VerificationCase.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('employee', 'firstName lastName email employeeId')
   .populate('company', 'name')
   .populate('assignedTo', 'firstName lastName email')
   .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'verification_case_update',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase.caseNumber}`
    },
    details: {
      description: `Verification case updated: ${verificationCase.caseNumber}`,
      category: 'verification',
      severity: 'low',
      ipAddress: req.ip,
      changes: Object.keys(updateData)
    }
  });

  // Send notification for status changes
  if (status && status !== verificationCase.status) {
    try {
      await NotificationService.sendVerificationNotification(
        verificationCase.employee,
        status,
        verificationCase._id
      );
    } catch (notificationError) {
      console.error('Failed to send status update notification:', notificationError);
    }
  }

  sendSuccessResponse(res, { case: updatedCase }, 'Verification case updated successfully');
}));

// @route   POST /api/verifications/:id/assign
// @desc    Assign verification case to verifier
// @access  Private/Admin
router.post('/:id/assign', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return sendErrorResponse(res, 400, 'Verifier ID is required');
  }

  const verificationCase = await VerificationCase.findById(req.params.id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  const verifier = await User.findById(assignedTo);
  if (!verifier || verifier.role !== 'Verifier') {
    return sendErrorResponse(res, 400, 'Assigned user must be a Verifier');
  }

  verificationCase.assignedTo = assignedTo;
  verificationCase.status = 'in_progress';
  verificationCase.startedAt = new Date();
  await verificationCase.save();

  const updatedCase = await VerificationCase.findById(req.params.id)
    .populate('employee', 'firstName lastName email employeeId')
    .populate('company', 'name')
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'verification_case_assign',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase.caseNumber}`
    },
    details: {
      description: `Case ${verificationCase.caseNumber} assigned to ${verifier.firstName} ${verifier.lastName}`,
      category: 'verification',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  // Send notification email to verifier
  try {
    await SESService.sendEmail(
      verifier.email,
      'New Verification Case Assigned',
      emailTemplates.caseAssigned.html({
        verifierName: `${verifier.firstName} ${verifier.lastName}`,
        caseNumber: verificationCase.caseNumber,
                  employeeName: `${updatedCase.employee.firstName} ${updatedCase.employee.lastName}`,
        companyName: updatedCase.company.name
      })
    );
  } catch (emailError) {
    console.error('Failed to send assignment email:', emailError);
  }

  sendSuccessResponse(res, { case: updatedCase }, 'Case assigned successfully');
}));

// @route   POST /api/verifications/:id/documents
// @desc    Upload documents for verification case
// @access  Private
router.post('/:id/documents', authenticateToken, authorizeCaseAccess, uploadSingle, validateDocumentUpload, asyncHandler(async (req, res) => {
  const { documentType, description } = req.body;

  if (!req.file) {
    return sendErrorResponse(res, 400, 'Document file is required');
  }

  const verificationCase = await VerificationCase.findById(req.params.id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Upload file to S3
  const uploadResult = await S3Service.uploadFile(req.file, 'verification-documents', {
    caseId: verificationCase._id.toString(),
    documentType: documentType,
    uploadedBy: req.user._id.toString()
  });

  // Add document to case
  const document = {
    filename: uploadResult.filename,
    originalName: uploadResult.originalName,
    s3Key: uploadResult.key,
    documentType: documentType,
    description: description,
    uploadedBy: req.user._id,
    uploadedAt: new Date()
  };

  verificationCase.documents.push(document);
  await verificationCase.save();

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'document_upload',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase.caseNumber}`
    },
    details: {
      description: `Document uploaded to case ${verificationCase.caseNumber}: ${documentType}`,
      category: 'document_management',
      severity: 'low',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, { document }, 'Document uploaded successfully');
}));

// @route   DELETE /api/verifications/:id/documents/:documentId
// @desc    Delete document from verification case
// @access  Private
router.delete('/:id/documents/:documentId', authenticateToken, authorizeCaseAccess, asyncHandler(async (req, res) => {
  const verificationCase = await VerificationCase.findById(req.params.id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  const document = verificationCase.documents.id(req.params.documentId);
  if (!document) {
    return sendErrorResponse(res, 404, 'Document not found');
  }

  // Only document uploader or Admin can delete
  if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return sendErrorResponse(res, 403, 'You can only delete your own documents');
  }

  // Delete from S3
  try {
    await S3Service.deleteFile(document.s3Key);
  } catch (error) {
    console.error('Failed to delete file from S3:', error);
  }

  // Remove document from case
  verificationCase.documents.pull(req.params.documentId);
  await verificationCase.save();

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'document_delete',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase.caseNumber}`
    },
    details: {
      description: `Document deleted from case ${verificationCase.caseNumber}: ${document.documentType}`,
      category: 'document_management',
      severity: 'low',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, null, 'Document deleted successfully');
}));

// @route   POST /api/verifications/:id/complete
// @desc    Complete verification case
// @access  Private/Verifier
router.post('/:id/complete', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { result, notes, verificationScore } = req.body;

  if (!result) {
    return sendErrorResponse(res, 400, 'Verification result is required');
  }

  const verificationCase = await VerificationCase.findById(req.params.id);
  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Verification case not found');
  }

  // Check if case is assigned to current verifier
  if (verificationCase.assignedTo?.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'You can only complete cases assigned to you');
  }

  // Check if case is in progress
  if (verificationCase.status !== 'in_progress') {
    return sendErrorResponse(res, 400, 'Case must be in progress to complete');
  }

  verificationCase.status = 'completed';
  verificationCase.result = result;
  verificationCase.verificationScore = verificationScore;
  verificationCase.completedAt = new Date();
  verificationCase.completedBy = req.user._id;
  
  if (notes) {
    verificationCase.notes = verificationCase.notes ? `${verificationCase.notes}\n\n${notes}` : notes;
  }

  await verificationCase.save();

  // Update employee verification status
  const employee = await User.findById(verificationCase.employee);
  if (employee) {
    employee.isVerified = result === 'verified';
    employee.verificationDate = new Date();
    employee.verifiedBy = req.user._id;
    await employee.save();
  }

  const updatedCase = await VerificationCase.findById(req.params.id)
    .populate('employee', 'firstName lastName email employeeId')
    .populate('company', 'name')
    .populate('assignedTo', 'firstName lastName email')
    .populate('completedBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'verification_case_complete',
    resource: {
      type: 'verification_case',
      id: verificationCase._id,
      name: `Case ${verificationCase.caseNumber}`
    },
    details: {
      description: `Verification case completed: ${verificationCase.caseNumber} - Result: ${result}`,
      category: 'verification',
      severity: 'high',
      ipAddress: req.ip
    }
  });

  // Send notification emails
  try {
    const employee = await User.findById(verificationCase.employee);
    const company = await Company.findById(verificationCase.company);
    
    await SESService.sendEmail(
      employee.email,
      'Verification Completed',
      emailTemplates.verificationCompleted.html({
        employeeName: `${employee.firstName} ${employee.lastName}`,
        caseNumber: verificationCase.caseNumber,
        result: result,
        companyName: company.name
      })
    );

    // Notify employer
    if (company.owner) {
      const employer = await User.findById(company.owner);
      if (employer) {
        await SESService.sendEmail(
          employer.email,
          'Employee Verification Completed',
          emailTemplates.employeeVerificationCompleted.html({
            employerName: employer.fullName,
            employeeName: employee.fullName,
            caseNumber: verificationCase.caseNumber,
            result: result,
            companyName: company.name
          })
        );
      }
    }
  } catch (emailError) {
    console.error('Failed to send completion emails:', emailError);
  }

  sendSuccessResponse(res, { case: updatedCase }, 'Verification case completed successfully');
}));

// @route   GET /api/verifications/statistics
// @desc    Get verification statistics
// @access  Private
router.get('/statistics/overview', authenticateToken, asyncHandler(async (req, res) => {
  const query = {};

  // Role-based filtering
  if (req.user.role === 'Employer') {
    query.company = req.user.company;
  } else if (req.user.role === 'Employee') {
    query.employee = req.user._id;
  } else if (req.user.role === 'Verifier') {
    query.$or = [
      { assignedTo: req.user._id },
      { assignedTo: null }
    ];
  }

  const [
    totalCases,
    pendingCases,
    inProgressCases,
    completedCases,
    verifiedCases,
    rejectedCases
  ] = await Promise.all([
    VerificationCase.countDocuments(query),
    VerificationCase.countDocuments({ ...query, status: 'pending' }),
    VerificationCase.countDocuments({ ...query, status: 'in_progress' }),
    VerificationCase.countDocuments({ ...query, status: 'completed' }),
    VerificationCase.countDocuments({ ...query, status: 'completed', result: 'verified' }),
    VerificationCase.countDocuments({ ...query, status: 'completed', result: 'rejected' })
  ]);

  const statistics = {
    total: totalCases,
    pending: pendingCases,
    inProgress: inProgressCases,
    completed: completedCases,
    verified: verifiedCases,
    rejected: rejectedCases,
    completionRate: totalCases > 0 ? ((completedCases / totalCases) * 100).toFixed(2) : 0,
    verificationRate: completedCases > 0 ? ((verifiedCases / completedCases) * 100).toFixed(2) : 0
  };

  sendSuccessResponse(res, { statistics });
}));

module.exports = router; 