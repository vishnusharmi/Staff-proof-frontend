const express = require('express');
const router = express.Router();

// Import models
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const VerificationCase = require('../Modals/VerificationCase');
const AccessRequest = require('../Modals/AccessRequest');
const Blacklist = require('../Modals/Blacklist');
const Billing = require('../Modals/Billing');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole 
} = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/dashboard/admin
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/admin', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const [
    totalUsers,
    totalCompanies,
    totalVerifications,
    totalAccessRequests,
    totalBlacklistEntries,
    totalRevenue,
    recentUsers,
    recentCompanies,
    recentVerifications,
    recentAccessRequests,
    recentAuditLogs,
    userStats,
    verificationStats,
    revenueStats,
    activityStats
  ] = await Promise.all([
    User.countDocuments({}),
    Company.countDocuments({}),
    VerificationCase.countDocuments({}),
    AccessRequest.countDocuments({}),
    Blacklist.countDocuments({ status: 'active' }),
    Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    User.find({}).sort({ createdAt: -1 }).limit(5).select('firstName lastName email role status createdAt'),
    Company.find({}).sort({ createdAt: -1 }).limit(5).select('name status createdAt'),
    VerificationCase.find({}).sort({ createdAt: -1 }).limit(5).populate('employee', 'firstName lastName').populate('company', 'name'),
    AccessRequest.find({}).sort({ createdAt: -1 }).limit(5).populate('requester', 'firstName lastName email'),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName email'),
    User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    VerificationCase.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Billing.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Calculate role distribution
  const roleDistribution = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate verification status distribution
  const verificationStatusDistribution = await VerificationCase.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate company status distribution
  const companyStatusDistribution = await Company.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const dashboardData = {
    overview: {
      totalUsers,
      totalCompanies,
      totalVerifications,
      totalAccessRequests,
      totalBlacklistEntries,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    recent: {
      users: recentUsers,
      companies: recentCompanies,
      verifications: recentVerifications,
      accessRequests: recentAccessRequests,
      auditLogs: recentAuditLogs
    },
    charts: {
      userStats,
      verificationStats,
      revenueStats,
      activityStats
    },
    distributions: {
      roles: roleDistribution,
      verificationStatus: verificationStatusDistribution,
      companyStatus: companyStatusDistribution
    }
  };

  sendSuccessResponse(res, { dashboardData });
}));

// @route   GET /api/dashboard/employer
// @desc    Get employer dashboard data
// @access  Private/Employer
router.get('/employer', authenticateToken, authorizeRole(['Employer']), asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const companyId = req.user.company;
  if (!companyId) {
    return sendErrorResponse(res, 400, 'Employer must be associated with a company');
  }

  const [
    totalEmployees,
    activeEmployees,
    pendingEmployees,
    totalVerifications,
    pendingVerifications,
    completedVerifications,
    verifiedEmployees,
    recentEmployees,
    recentVerifications,
    recentBilling,
    employeeStats,
    verificationStats,
    billingStats
  ] = await Promise.all([
    User.countDocuments({ company: companyId, role: 'Employee' }),
    User.countDocuments({ company: companyId, role: 'Employee', status: 'active' }),
    User.countDocuments({ company: companyId, role: 'Employee', status: 'pending' }),
    VerificationCase.countDocuments({ company: companyId }),
    VerificationCase.countDocuments({ company: companyId, status: 'pending' }),
    VerificationCase.countDocuments({ company: companyId, status: 'completed' }),
    User.countDocuments({ company: companyId, role: 'Employee', isVerified: true }),
    User.find({ company: companyId, role: 'Employee' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email status employeeId createdAt'),
    VerificationCase.find({ company: companyId }).sort({ createdAt: -1 }).limit(5).populate('employee', 'firstName lastName').populate('assignedTo', 'firstName lastName'),
    Billing.find({ company: companyId }).sort({ createdAt: -1 }).limit(5).select('invoiceNumber amount status dueDate'),
    User.aggregate([
      { $match: { company: companyId, role: 'Employee', createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    VerificationCase.aggregate([
      { $match: { company: companyId, createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Billing.aggregate([
      { $match: { company: companyId, createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Calculate employee status distribution
  const employeeStatusDistribution = await User.aggregate([
    { $match: { company: companyId, role: 'Employee' } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate verification status distribution
  const verificationStatusDistribution = await VerificationCase.aggregate([
    { $match: { company: companyId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate department distribution
  const departmentDistribution = await User.aggregate([
    { $match: { company: companyId, role: 'Employee', department: { $exists: true, $ne: null } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const dashboardData = {
    overview: {
      totalEmployees,
      activeEmployees,
      pendingEmployees,
      totalVerifications,
      pendingVerifications,
      completedVerifications,
      verifiedEmployees,
      verificationRate: totalEmployees > 0 ? ((verifiedEmployees / totalEmployees) * 100).toFixed(2) : 0
    },
    recent: {
      employees: recentEmployees,
      verifications: recentVerifications,
      billing: recentBilling
    },
    charts: {
      employeeStats,
      verificationStats,
      billingStats
    },
    distributions: {
      employeeStatus: employeeStatusDistribution,
      verificationStatus: verificationStatusDistribution,
      departments: departmentDistribution
    }
  };

  sendSuccessResponse(res, { dashboardData });
}));

// @route   GET /api/dashboard/verifier
// @desc    Get verifier dashboard data
// @access  Private/Verifier
router.get('/verifier', authenticateToken, authorizeRole(['Verifier']), asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const verifierId = req.user._id;

  const [
    assignedCases,
    completedCases,
    pendingCases,
    totalCases,
    averageCompletionTime,
    recentCases,
    recentCompletions,
    caseStats,
    completionStats,
    priorityDistribution
  ] = await Promise.all([
    VerificationCase.countDocuments({ assignedTo: verifierId, status: 'in_progress' }),
    VerificationCase.countDocuments({ assignedTo: verifierId, status: 'completed' }),
    VerificationCase.countDocuments({ assignedTo: verifierId, status: 'pending' }),
    VerificationCase.countDocuments({ assignedTo: verifierId }),
    VerificationCase.aggregate([
      { $match: { assignedTo: verifierId, status: 'completed', completedAt: { $exists: true } } },
      { $addFields: { completionTime: { $subtract: ['$completedAt', '$startedAt'] } } },
      { $group: { _id: null, avgTime: { $avg: '$completionTime' } } }
    ]),
    VerificationCase.find({ assignedTo: verifierId }).sort({ createdAt: -1 }).limit(5).populate('employee', 'firstName lastName').populate('company', 'name'),
    VerificationCase.find({ assignedTo: verifierId, status: 'completed' }).sort({ completedAt: -1 }).limit(5).populate('employee', 'firstName lastName').populate('company', 'name'),
    VerificationCase.aggregate([
      { $match: { assignedTo: verifierId, createdAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    VerificationCase.aggregate([
      { $match: { assignedTo: verifierId, status: 'completed', completedAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    VerificationCase.aggregate([
      { $match: { assignedTo: verifierId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  // Calculate verification result distribution
  const resultDistribution = await VerificationCase.aggregate([
    { $match: { assignedTo: verifierId, status: 'completed' } },
    { $group: { _id: '$result', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate average verification score
  const averageScore = await VerificationCase.aggregate([
    { $match: { assignedTo: verifierId, status: 'completed', verificationScore: { $exists: true } } },
    { $group: { _id: null, avgScore: { $avg: '$verificationScore' } } }
  ]);

  const dashboardData = {
    overview: {
      assignedCases,
      completedCases,
      pendingCases,
      totalCases,
      completionRate: totalCases > 0 ? ((completedCases / totalCases) * 100).toFixed(2) : 0,
      averageCompletionTime: averageCompletionTime[0]?.avgTime || 0,
      averageScore: averageScore[0]?.avgScore || 0
    },
    recent: {
      cases: recentCases,
      completions: recentCompletions
    },
    charts: {
      caseStats,
      completionStats
    },
    distributions: {
      priority: priorityDistribution,
      results: resultDistribution
    }
  };

  sendSuccessResponse(res, { dashboardData });
}));

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard data
// @access  Private/Employee
router.get('/employee', authenticateToken, authorizeRole(['Employee']), asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const [
    verificationCases,
    completedVerifications,
    pendingVerifications,
    isVerified,
    recentCases,
    recentDocuments,
    caseHistory
  ] = await Promise.all([
    VerificationCase.countDocuments({ employee: employeeId }),
    VerificationCase.countDocuments({ employee: employeeId, status: 'completed' }),
    VerificationCase.countDocuments({ employee: employeeId, status: { $in: ['pending', 'in_progress'] } }),
    req.user.isVerified,
    VerificationCase.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'firstName lastName').populate('company', 'name'),
    VerificationCase.aggregate([
      { $match: { employee: employeeId } },
      { $unwind: '$documents' },
      { $sort: { 'documents.uploadedAt': -1 } },
      { $limit: 5 },
      { $project: { document: '$documents', caseNumber: 1 } }
    ]),
    VerificationCase.find({ employee: employeeId }).sort({ createdAt: -1 }).select('caseNumber status createdAt completedAt result')
  ]);

  // Get company information
      const company = await Company.findById(req.user.company).select('name');

  // Calculate verification progress
  const verificationProgress = completedVerifications > 0 ? ((completedVerifications / verificationCases) * 100).toFixed(2) : 0;

  const dashboardData = {
    overview: {
      verificationCases,
      completedVerifications,
      pendingVerifications,
      isVerified,
      verificationProgress,
      company: company
    },
    recent: {
      cases: recentCases,
      documents: recentDocuments
    },
    history: {
      caseHistory
    }
  };

  sendSuccessResponse(res, { dashboardData });
}));

// @route   GET /api/dashboard/analytics
// @desc    Get analytics data for charts
// @access  Private
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    type, 
    period = '30', 
    companyId,
    startDate,
    endDate 
  } = req.query;

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.$gte = new Date(startDate);
    dateFilter.$lte = new Date(endDate);
  } else {
    dateFilter.$gte = daysAgo;
  }

  // Role-based filtering
  const companyFilter = {};
  if (req.user.role === 'Employer' && req.user.company) {
    companyFilter.company = req.user.company;
  } else if (companyId && req.user.role === 'Admin') {
    companyFilter.company = companyId;
  }

  let analyticsData = {};

  switch (type) {
    case 'user_registration':
      analyticsData = await User.aggregate([
        { $match: { createdAt: dateFilter, ...companyFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'verification_cases':
      analyticsData = await VerificationCase.aggregate([
        { $match: { createdAt: dateFilter, ...companyFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'verification_completions':
      analyticsData = await VerificationCase.aggregate([
        { $match: { status: 'completed', completedAt: dateFilter, ...companyFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'revenue':
      analyticsData = await Billing.aggregate([
        { $match: { status: 'paid', paidAt: dateFilter, ...companyFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'access_requests':
      analyticsData = await AccessRequest.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'system_activity':
      analyticsData = await AuditLog.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      break;

    default:
      return sendErrorResponse(res, 400, 'Invalid analytics type');
  }

  sendSuccessResponse(res, { analyticsData });
}));

// @route   GET /api/dashboard/notifications
// @desc    Get dashboard notifications
// @access  Private
router.get('/notifications', authenticateToken, asyncHandler(async (req, res) => {
  const notifications = [];

  // Role-based notifications
  if (req.user.role === 'Admin') {
    // Admin notifications
    const [
      pendingAccessRequests,
      highRiskAuditLogs,
      overdueBilling,
      pendingVerifications
    ] = await Promise.all([
      AccessRequest.countDocuments({ status: 'pending' }),
      AuditLog.countDocuments({ severity: { $in: ['high', 'critical'] }, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Billing.countDocuments({ status: 'pending', dueDate: { $lt: new Date() } }),
      VerificationCase.countDocuments({ status: 'pending' })
    ]);

    if (pendingAccessRequests > 0) {
      notifications.push({
        type: 'warning',
        title: 'Pending Access Requests',
        message: `${pendingAccessRequests} access requests are pending approval`,
        count: pendingAccessRequests,
        action: '/admin/access-requests'
      });
    }

    if (highRiskAuditLogs > 0) {
      notifications.push({
        type: 'danger',
        title: 'High Risk Activities',
        message: `${highRiskAuditLogs} high-risk activities detected in the last 24 hours`,
        count: highRiskAuditLogs,
        action: '/admin/audit-logs'
      });
    }

    if (overdueBilling > 0) {
      notifications.push({
        type: 'warning',
        title: 'Overdue Payments',
        message: `${overdueBilling} billing records are overdue`,
        count: overdueBilling,
        action: '/admin/billing'
      });
    }

    if (pendingVerifications > 0) {
      notifications.push({
        type: 'info',
        title: 'Pending Verifications',
        message: `${pendingVerifications} verification cases are pending assignment`,
        count: pendingVerifications,
        action: '/admin/verifications'
      });
    }
  } else if (req.user.role === 'Employer') {
    // Employer notifications
    const [
      pendingEmployees,
      pendingVerifications,
      overdueBilling
    ] = await Promise.all([
      User.countDocuments({ company: req.user.company, role: 'Employee', status: 'pending' }),
      VerificationCase.countDocuments({ company: req.user.company, status: 'pending' }),
      Billing.countDocuments({ company: req.user.company, status: 'pending', dueDate: { $lt: new Date() } })
    ]);

    if (pendingEmployees > 0) {
      notifications.push({
        type: 'info',
        title: 'Pending Employees',
        message: `${pendingEmployees} employees are pending activation`,
        count: pendingEmployees,
        action: '/employer/employees'
      });
    }

    if (pendingVerifications > 0) {
      notifications.push({
        type: 'warning',
        title: 'Pending Verifications',
        message: `${pendingVerifications} verification cases are pending`,
        count: pendingVerifications,
        action: '/employer/verifications'
      });
    }

    if (overdueBilling > 0) {
      notifications.push({
        type: 'danger',
        title: 'Overdue Payments',
        message: `${overdueBilling} payments are overdue`,
        count: overdueBilling,
        action: '/employer/billing'
      });
    }
  } else if (req.user.role === 'Verifier') {
    // Verifier notifications
    const [
      assignedCases,
      overdueCases
    ] = await Promise.all([
      VerificationCase.countDocuments({ assignedTo: req.user._id, status: 'in_progress' }),
      VerificationCase.countDocuments({ 
        assignedTo: req.user._id, 
        status: 'in_progress',
        dueDate: { $lt: new Date() }
      })
    ]);

    if (assignedCases > 0) {
      notifications.push({
        type: 'info',
        title: 'Assigned Cases',
        message: `You have ${assignedCases} verification cases assigned`,
        count: assignedCases,
        action: '/verifier/cases'
      });
    }

    if (overdueCases > 0) {
      notifications.push({
        type: 'danger',
        title: 'Overdue Cases',
        message: `${overdueCases} verification cases are overdue`,
        count: overdueCases,
        action: '/verifier/cases'
      });
    }
  } else if (req.user.role === 'Employee') {
    // Employee notifications
    const [
      pendingVerifications,
      pendingDocuments
    ] = await Promise.all([
      VerificationCase.countDocuments({ employee: req.user._id, status: { $in: ['pending', 'in_progress'] } }),
      VerificationCase.countDocuments({ 
        employee: req.user._id, 
        status: { $in: ['pending', 'in_progress'] },
        'requiredDocuments': { $exists: true, $ne: [] }
      })
    ]);

    if (pendingVerifications > 0) {
      notifications.push({
        type: 'info',
        title: 'Verification Status',
        message: `You have ${pendingVerifications} verification cases in progress`,
        count: pendingVerifications,
        action: '/employee/verifications'
      });
    }

    if (pendingDocuments > 0) {
      notifications.push({
        type: 'warning',
        title: 'Document Upload',
        message: `Please upload required documents for verification`,
        count: pendingDocuments,
        action: '/employee/documents'
      });
    }
  }

  sendSuccessResponse(res, { notifications });
}));

module.exports = router; 