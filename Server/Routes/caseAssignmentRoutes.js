const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../Middlewares/auth');
const { asyncHandler } = require('../Middlewares/errorHandler');
const { sendSuccessResponse, sendErrorResponse } = require('../Services/OneServices');
const User = require('../Modals/User');
const VerificationCase = require('../Modals/VerificationCase');

// @route   GET /api/case-assignments
// @desc    Get all cases with assignment status and filters
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    status = '', 
    userType = '', 
    priority = '' 
  } = req.query;
  
  const skip = (page - 1) * limit;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { 'employee.firstName': { $regex: search, $options: 'i' } },
      { 'employee.lastName': { $regex: search, $options: 'i' } },
      { 'employee.email': { $regex: search, $options: 'i' } },
      { 'employee.employeeId': { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    query.status = status;
  }

  if (userType) {
    query.userType = userType;
  }

  if (priority) {
    query.priority = priority;
  }

  // Get cases with employee and company info
  const cases = await VerificationCase.find(query)
    .populate('employee', 'firstName lastName email employeeId')
    .populate('company', 'name')
    .populate('assignedVerifier', 'firstName lastName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  // Get available verifiers
  const verifiers = await User.find({ role: 'Verifier' })
    .select('firstName lastName email')
    .sort({ firstName: 1 });

  const total = await VerificationCase.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Transform cases to match frontend expectations
  const transformedCases = cases.map(caseItem => ({
    id: caseItem._id,
    name: `${caseItem.employee?.firstName || ''} ${caseItem.employee?.lastName || ''}`.trim() || 'Unknown',
    email: caseItem.employee?.email || '',
    type: caseItem.userType || 'employee',
    company: caseItem.company?.name || 'Unknown',
    createdAt: caseItem.createdAt,
    status: caseItem.status,
    documentsCount: caseItem.documents?.length || 0,
    verifier: caseItem.assignedVerifier ? `${caseItem.assignedVerifier.firstName} ${caseItem.assignedVerifier.lastName}` : null,
    priority: caseItem.priority || 'medium',
    daysWaiting: Math.floor((Date.now() - new Date(caseItem.createdAt)) / (1000 * 60 * 60 * 24))
  }));

  // Transform verifiers
  const transformedVerifiers = verifiers.map(verifier => ({
    id: verifier._id,
    name: `${verifier.firstName} ${verifier.lastName}`,
    email: verifier.email,
    assignedCases: 0, // This would need to be calculated
    maxCapacity: 20
  }));

  return sendSuccessResponse(res, 200, 'Cases retrieved successfully', {
    data: transformedCases,
    verifiers: transformedVerifiers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages
    }
  });
}));

// @route   POST /api/case-assignments/:caseId/assign
// @desc    Assign or reassign a case to a verifier
// @access  Private/Admin
router.post('/:caseId/assign', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  const { verifierId } = req.body;

  if (!verifierId) {
    return sendErrorResponse(res, 400, 'Verifier ID is required');
  }

  // Check if case exists
  const caseItem = await VerificationCase.findById(caseId)
    .populate('employee', 'firstName lastName email')
    .populate('company', 'name');

  if (!caseItem) {
    return sendErrorResponse(res, 404, 'Case not found');
  }

  // Check if verifier exists
  const verifier = await User.findOne({ _id: verifierId, role: 'Verifier' });
  if (!verifier) {
    return sendErrorResponse(res, 404, 'Verifier not found');
  }

  // Update case assignment
  const updatedCase = await VerificationCase.findByIdAndUpdate(
    caseId,
    {
      assignedVerifier: verifierId,
      status: 'assigned',
      assignedAt: new Date()
    },
    { new: true }
  ).populate('assignedVerifier', 'firstName lastName email');

  // Log the action
  const AuditLog = require('../Modals/AuditLog');
  await AuditLog.create({
    admin: req.user._id,
    action: 'ASSIGN_CASE',
    details: `Assigned case ${caseId} to verifier ${verifier.firstName} ${verifier.lastName}`,
    target_user: caseItem.employee?._id,
    target_type: 'Employee',
    status: 'Success'
  });

  return sendSuccessResponse(res, 200, 'Case assigned successfully', updatedCase);
}));

// @route   GET /api/case-assignments/verifiers
// @desc    Get all available verifiers with their workload
// @access  Private/Admin
router.get('/verifiers', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const verifiers = await User.find({ role: 'Verifier' })
    .select('firstName lastName email assignedCases maxCapacity');

  // Calculate current workload for each verifier
  const verifiersWithWorkload = await Promise.all(
    verifiers.map(async (verifier) => {
      const assignedCases = await VerificationCase.countDocuments({
        assignedVerifier: verifier._id,
        status: { $in: ['assigned', 'in_verification'] }
      });

      return {
        id: verifier._id,
        name: `${verifier.firstName} ${verifier.lastName}`,
        email: verifier.email,
        assignedCases,
        maxCapacity: verifier.maxCapacity || 20,
        workloadPercentage: Math.round((assignedCases / (verifier.maxCapacity || 20)) * 100)
      };
    })
  );

  return sendSuccessResponse(res, 200, 'Verifiers retrieved successfully', verifiersWithWorkload);
}));

// @route   GET /api/case-assignments/stats
// @desc    Get case assignment statistics
// @access  Private/Admin
router.get('/stats', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const totalCases = await VerificationCase.countDocuments();
  const unassignedCases = await VerificationCase.countDocuments({ status: 'unassigned' });
  const assignedCases = await VerificationCase.countDocuments({ status: 'assigned' });
  const inVerificationCases = await VerificationCase.countDocuments({ status: 'in_verification' });
  const highPriorityCases = await VerificationCase.countDocuments({ priority: 'high' });

  const stats = {
    totalCases,
    unassigned: unassignedCases,
    assigned: assignedCases,
    inVerification: inVerificationCases,
    highPriority: highPriorityCases
  };

  return sendSuccessResponse(res, 200, 'Statistics retrieved successfully', stats);
}));

module.exports = router; 