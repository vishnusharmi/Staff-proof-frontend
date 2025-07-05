const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../Middlewares/auth');
const { asyncHandler } = require('../Middlewares/errorHandler');
const { sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const VerificationCase = require('../Modals/VerificationCase');
const AuditLog = require('../Modals/AuditLog');

// @route   GET /api/verifier/communication/employees
// @desc    Get employees for communication
// @access  Private/Verifier
router.get('/communication/employees', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  let query = { role: 'Employee' };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { staffProofId: { $regex: search, $options: 'i' } }
    ];
  }

  const employees = await User.find(query)
    .select('firstName lastName email staffProofId department')
    .limit(20);

  const transformedEmployees = employees.map(emp => ({
    id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    staffProofId: emp.staffProofId,
    department: emp.department
  }));

  return sendSuccessResponse(res, 200, 'Employees retrieved successfully', transformedEmployees);
}));

// @route   GET /api/verifier/communication/companies
// @desc    Get companies for communication
// @access  Private/Verifier
router.get('/communication/companies', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const companies = await Company.find(query)
    .select('name')
    .limit(20);

  const transformedCompanies = companies.map(comp => ({
    id: comp._id,
    name: comp.name
  }));

  return sendSuccessResponse(res, 200, 'Companies retrieved successfully', transformedCompanies);
}));

// @route   GET /api/verifier/communication/clarifications
// @desc    Get clarification requests
// @access  Private/Verifier
router.get('/communication/clarifications', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const verifierId = req.user._id;
  const { type, status } = req.query;

  let query = { verifierId };
  
  if (type) {
    query.type = type; // 'employee', 'company', 'admin'
  }
  
  if (status) {
    query.status = status; // 'pending', 'responded', 'resolved'
  }

  // This would typically come from a Communication model
  // For now, we'll return mock data structure
  const clarifications = [
    {
      id: 1,
      type: 'employee',
      message: "Please provide a clearer scan of your experience letter from TechCorp. The current image is blurry and unreadable.",
      sentAt: "2025-06-10T14:30:00Z",
      status: "pending",
      employeeResponse: null,
      employeeName: "John Smith",
      employeeId: "employee_id_1",
      verifierId: verifierId
    },
    {
      id: 2,
      type: 'company',
      message: "We need verification of employment dates for John Smith (Employee ID: EMP001). Please confirm his tenure from 2020-2023.",
      sentAt: "2025-06-10T11:00:00Z",
      status: "pending",
      companyResponse: null,
      companyName: "TechCorp Solutions",
      companyId: "company_id_1",
      verifierId: verifierId
    }
  ];

  return sendSuccessResponse(res, 200, 'Clarifications retrieved successfully', clarifications);
}));

// @route   POST /api/verifier/communication/clarification
// @desc    Send clarification request
// @access  Private/Verifier
router.post('/communication/clarification', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { type, recipientId, message, recipientType } = req.body;
  const verifierId = req.user._id;

  if (!type || !recipientId || !message) {
    return sendErrorResponse(res, 400, 'Type, recipient ID, and message are required');
  }

  // Validate recipient exists
  let recipient;
  if (recipientType === 'employee') {
    recipient = await User.findById(recipientId);
  } else if (recipientType === 'company') {
    recipient = await Company.findById(recipientId);
  }

  if (!recipient) {
    return sendErrorResponse(res, 404, 'Recipient not found');
  }

  // Create clarification request (would be saved to Communication model)
  const clarification = {
    id: Date.now(),
    type,
    recipientId,
    recipientType,
    message,
    verifierId,
    sentAt: new Date().toISOString(),
    status: 'pending'
  };

  // Log activity
  await AuditLog.create({
    userId: verifierId,
    action: 'clarification_sent',
    details: `Sent clarification to ${recipientType}: ${recipient.name || recipient.firstName}`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  return sendSuccessResponse(res, 201, 'Clarification sent successfully', clarification);
}));

// @route   GET /api/verifier/notes
// @desc    Get verifier notes
// @access  Private/Verifier
router.get('/notes', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const verifierId = req.user._id;
  const { caseId, type } = req.query;

  let query = { verifierId };
  
  if (caseId) {
    query.caseId = caseId;
  }
  
  if (type) {
    query.type = type; // 'internal', 'case_note', 'activity'
  }

  // This would typically come from a Notes model
  // For now, we'll return mock data structure
  const notes = [
    {
      id: 1,
      verifierId,
      verifierName: `${req.user.firstName} ${req.user.lastName}`,
      message: "Experience letter from TechCorp appears authentic. Verified company letterhead and HR contact details.",
      timestamp: "2024-06-11T10:30:00Z",
      type: 'internal',
      isPrivate: true,
      attachments: [],
      caseId: caseId || null
    },
    {
      id: 2,
      verifierId,
      verifierName: `${req.user.firstName} ${req.user.lastName}`,
      message: "Payslip amounts match declared salary. No discrepancies found.",
      timestamp: "2024-06-11T09:15:00Z",
      type: 'case_note',
      isPrivate: true,
      attachments: ["payslip_verification.png"],
      caseId: caseId || null
    }
  ];

  return sendSuccessResponse(res, 200, 'Notes retrieved successfully', notes);
}));

// @route   POST /api/verifier/notes
// @desc    Create verifier note
// @access  Private/Verifier
router.post('/notes', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { message, type, caseId, isPrivate, attachments } = req.body;
  const verifierId = req.user._id;

  if (!message) {
    return sendErrorResponse(res, 400, 'Message is required');
  }

  // Validate case exists if caseId provided
  if (caseId) {
    const caseExists = await VerificationCase.findById(caseId);
    if (!caseExists) {
      return sendErrorResponse(res, 404, 'Case not found');
    }
  }

  // Create note (would be saved to Notes model)
  const note = {
    id: Date.now(),
    verifierId,
    verifierName: `${req.user.firstName} ${req.user.lastName}`,
    message,
    timestamp: new Date().toISOString(),
    type: type || 'internal',
    isPrivate: isPrivate !== false,
    attachments: attachments || [],
    caseId: caseId || null
  };

  // Log activity
  await AuditLog.create({
    userId: verifierId,
    action: 'note_created',
    details: `Created ${type || 'internal'} note`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  return sendSuccessResponse(res, 201, 'Note created successfully', note);
}));

// @route   GET /api/verifier/companies/cases
// @desc    Get company verification cases assigned to verifier
// @access  Private/Verifier
router.get('/companies/cases', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const verifierId = req.user._id;
  const { search, status, priority, page = 1, limit = 10 } = req.query;

  let query = { assignedTo: verifierId, type: 'company' };
  
  if (search) {
    query.$or = [
      { 'company.name': { $regex: search, $options: 'i' } },
      { caseNumber: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  const skip = (page - 1) * limit;
  
  const cases = await VerificationCase.find(query)
    .populate('company', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await VerificationCase.countDocuments(query);

  const transformedCases = cases.map(case_ => ({
    id: case_.caseNumber,
    companyName: case_.company?.name || 'Unknown Company',
    profileStatus: case_.status === 'completed' ? 'Completed' : 
                   case_.status === 'in_progress' ? 'In Progress' : 'New',
    assignedDate: case_.assignedAt || case_.createdAt,
    priority: case_.priority || 'medium',
    documentsCount: case_.documents?.length || 0,
    completedDocs: case_.documents?.filter(d => d.status === 'verified').length || 0,
    employeeCount: case_.company?.employeeCount || 0,
    industry: case_.company?.industry || 'Unknown',
    location: case_.company?.location || 'Unknown',
    contactInfo: {
      email: case_.company?.email || '',
      phone: case_.company?.contact || '',
      website: case_.company?.website || ''
    },
    verificationProgress: case_.verificationProgress || 0,
    lastActivity: case_.updatedAt,
    registrationNumber: case_.company?.registrationNumber || '',
    foundedYear: case_.company?.foundedYear || '',
    headquarters: case_.company?.headquarters || ''
  }));

  return sendSuccessResponse(res, 200, 'Company cases retrieved successfully', {
    cases: transformedCases,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/verifier/employees/cases
// @desc    Get employee verification cases assigned to verifier
// @access  Private/Verifier
router.get('/employees/cases', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const verifierId = req.user._id;
  const { search, status, priority, page = 1, limit = 10 } = req.query;

  let query = { assignedTo: verifierId, type: 'employee' };
  
  if (search) {
    query.$or = [
      { 'employee.firstName': { $regex: search, $options: 'i' } },
      { 'employee.lastName': { $regex: search, $options: 'i' } },
      { caseNumber: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  const skip = (page - 1) * limit;
  
  const cases = await VerificationCase.find(query)
    .populate('employee', 'firstName lastName email staffProofId department')
    .populate('company', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await VerificationCase.countDocuments(query);

  const transformedCases = cases.map(case_ => ({
    id: case_.caseNumber,
    employeeName: `${case_.employee?.firstName || ''} ${case_.employee?.lastName || ''}`,
    profileStatus: case_.status === 'completed' ? 'Completed' : 
                   case_.status === 'flagged' ? 'Flagged' :
                   case_.status === 'in_progress' ? 'In Progress' : 'New',
    assignedDate: case_.assignedAt || case_.createdAt,
    status: case_.status,
    priority: case_.priority || 'medium',
    documents: {
      resume: case_.documents?.find(d => d.type === 'resume')?.status || 'pending',
      govtId: case_.documents?.find(d => d.type === 'govtId')?.status || 'pending',
      payslips: case_.documents?.find(d => d.type === 'payslips')?.status || 'pending',
      experienceLetters: case_.documents?.find(d => d.type === 'experienceLetters')?.status || 'pending',
      educationalCerts: case_.documents?.find(d => d.type === 'educationalCerts')?.status || 'pending'
    },
    company: case_.company?.name || 'Unknown Company'
  }));

  return sendSuccessResponse(res, 200, 'Employee cases retrieved successfully', {
    cases: transformedCases,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   PUT /api/verifier/cases/:id/status
// @desc    Update case status
// @access  Private/Verifier
router.put('/cases/:id/status', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const verifierId = req.user._id;

  if (!status) {
    return sendErrorResponse(res, 400, 'Status is required');
  }

  const verificationCase = await VerificationCase.findOne({ 
    caseNumber: id, 
    assignedTo: verifierId 
  });

  if (!verificationCase) {
    return sendErrorResponse(res, 404, 'Case not found or not assigned to you');
  }

  // Update case status
  verificationCase.status = status;
  if (status === 'completed') {
    verificationCase.completedAt = new Date();
  }
  
  if (notes) {
    verificationCase.notes = verificationCase.notes || [];
    verificationCase.notes.push({
      verifierId,
      message: notes,
      timestamp: new Date()
    });
  }

  await verificationCase.save();

  // Log activity
  await AuditLog.create({
    userId: verifierId,
    action: 'case_status_updated',
    details: `Updated case ${id} status to ${status}`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  return sendSuccessResponse(res, 200, 'Case status updated successfully', verificationCase);
}));

// @route   GET /api/verifier/activity
// @desc    Get verifier activity log
// @access  Private/Verifier
router.get('/activity', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const verifierId = req.user._id;
  const { action, page = 1, limit = 20 } = req.query;

  let query = { userId: verifierId };
  
  if (action && action !== 'all') {
    query.action = action;
  }

  const skip = (page - 1) * limit;
  
  const activities = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(query);

  const transformedActivities = activities.map(activity => ({
    id: activity._id,
    action: activity.action,
    actionText: getActionText(activity.action),
    verifierId: activity.userId,
    verifierName: `${req.user.firstName} ${req.user.lastName}`,
    timestamp: activity.timestamp,
    icon: getActionIcon(activity.action),
    color: getActionColor(activity.action),
    bgColor: getActionBgColor(activity.action),
    details: activity.details
  }));

  return sendSuccessResponse(res, 200, 'Activity log retrieved successfully', {
    activities: transformedActivities,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Helper functions for activity formatting
function getActionText(action) {
  const actionTexts = {
    'clarification_sent': 'Sent Clarification Request',
    'note_created': 'Added Internal Note',
    'case_status_updated': 'Updated Case Status',
    'document_viewed': 'Viewed Document',
    'document_verified': 'Verified Document',
    'document_flagged': 'Flagged Document',
    'evidence_uploaded': 'Uploaded Supporting Evidence',
    'case_assigned': 'Case Assigned'
  };
  return actionTexts[action] || 'Performed Action';
}

function getActionIcon(action) {
  const icons = {
    'clarification_sent': 'MessageSquare',
    'note_created': 'MessageSquare',
    'case_status_updated': 'CheckCircle',
    'document_viewed': 'Eye',
    'document_verified': 'CheckCircle',
    'document_flagged': 'Flag',
    'evidence_uploaded': 'Upload',
    'case_assigned': 'User'
  };
  return icons[action] || 'Activity';
}

function getActionColor(action) {
  const colors = {
    'clarification_sent': 'text-blue-600',
    'note_created': 'text-indigo-600',
    'case_status_updated': 'text-green-600',
    'document_viewed': 'text-blue-600',
    'document_verified': 'text-green-600',
    'document_flagged': 'text-yellow-600',
    'evidence_uploaded': 'text-purple-600',
    'case_assigned': 'text-gray-600'
  };
  return colors[action] || 'text-gray-600';
}

function getActionBgColor(action) {
  const bgColors = {
    'clarification_sent': 'bg-blue-50',
    'note_created': 'bg-indigo-50',
    'case_status_updated': 'bg-green-50',
    'document_viewed': 'bg-blue-50',
    'document_verified': 'bg-green-50',
    'document_flagged': 'bg-yellow-50',
    'evidence_uploaded': 'bg-purple-50',
    'case_assigned': 'bg-gray-50'
  };
  return bgColors[action] || 'bg-gray-50';
}

module.exports = router; 