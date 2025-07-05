const express = require('express');
const router = express.Router();

// Import models
const AuditLog = require('../Modals/AuditLog');
const User = require('../Modals/User');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole 
} = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/audit
// @desc    Get audit logs with filtering
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    action, 
    category, 
    severity, 
    userId, 
    resourceType,
    startDate,
    endDate,
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = {};

  if (action) query.action = action;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (userId) query.user = userId;
  if (resourceType) query['resource.type'] = resourceType;
  
  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (search) {
    query.$or = [
      { 'details.description': { $regex: search, $options: 'i' } },
      { 'resource.name': { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const auditLogs = await AuditLog.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  const total = await AuditLog.countDocuments(query);

  sendSuccessResponse(res, {
    auditLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/audit/:id
// @desc    Get audit log by ID
// @access  Private/Admin
router.get('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const auditLog = await AuditLog.findById(req.params.id)
    .populate('user', 'firstName lastName email role phone')
    .populate('resource', 'firstName lastName name email phone');

  if (!auditLog) {
    return sendErrorResponse(res, 404, 'Audit log not found');
  }

  sendSuccessResponse(res, { auditLog });
}));

// @route   GET /api/audit/user/:userId
// @desc    Get audit logs for specific user
// @access  Private/Admin
router.get('/user/:userId', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    action, 
    category, 
    severity,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = { user: req.params.userId };

  if (action) query.action = action;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  
  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const auditLogs = await AuditLog.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  const total = await AuditLog.countDocuments(query);

  // Get user details
  const user = await User.findById(req.params.userId).select('firstName lastName email role');

  sendSuccessResponse(res, {
    user,
    auditLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/audit/high-risk
// @desc    Get high-risk audit logs
// @access  Private/Admin
router.get('/high-risk', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = { 
    $or: [
      { severity: 'high' },
      { severity: 'critical' }
    ]
  };
  
  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const auditLogs = await AuditLog.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  const total = await AuditLog.countDocuments(query);

  sendSuccessResponse(res, {
    auditLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/audit/security
// @desc    Get security-related audit logs
// @access  Private/Admin
router.get('/security', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = { 
    $or: [
      { category: 'authentication' },
      { category: 'authorization' },
      { category: 'security' },
      { category: 'blacklist_management' },
      { action: { $regex: /login|logout|password|token|access|security/i } }
    ]
  };
  
  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const auditLogs = await AuditLog.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  const total = await AuditLog.countDocuments(query);

  sendSuccessResponse(res, {
    auditLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/audit/statistics
// @desc    Get audit statistics
// @access  Private/Admin
router.get('/statistics/overview', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }

  const [
    totalLogs,
    todayLogs,
    highRiskLogs,
    securityLogs,
    authenticationLogs,
    userActivityLogs,
    systemLogs,
    bySeverity,
    byCategory,
    byAction,
    topUsers
  ] = await Promise.all([
    AuditLog.countDocuments(dateFilter),
    AuditLog.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }),
    AuditLog.countDocuments({
      ...dateFilter,
      severity: { $in: ['high', 'critical'] }
    }),
    AuditLog.countDocuments({
      ...dateFilter,
      category: { $in: ['authentication', 'authorization', 'security'] }
    }),
    AuditLog.countDocuments({
      ...dateFilter,
      category: 'authentication'
    }),
    AuditLog.countDocuments({
      ...dateFilter,
      category: 'user_activity'
    }),
    AuditLog.countDocuments({
      ...dateFilter,
      category: 'system'
    }),
    AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    AuditLog.aggregate([
      { $match: { ...dateFilter, user: { $exists: true, $ne: null } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          user: {
            _id: '$userDetails._id',
            firstName: '$userDetails.firstName',
            lastName: '$userDetails.lastName',
            email: '$userDetails.email',
            role: '$userDetails.role'
          },
          count: 1
        }
      }
    ])
  ]);

  const statistics = {
    total: totalLogs,
    today: todayLogs,
    highRisk: highRiskLogs,
    security: securityLogs,
    authentication: authenticationLogs,
    userActivity: userActivityLogs,
    system: systemLogs,
    bySeverity: bySeverity.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byCategory: byCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    topActions: byAction,
    topUsers: topUsers
  };

  sendSuccessResponse(res, { statistics });
}));

// @route   GET /api/audit/export
// @desc    Export audit logs
// @access  Private/Admin
router.get('/export', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    action, 
    category, 
    severity, 
    userId, 
    resourceType,
    startDate,
    endDate,
    format = 'json'
  } = req.query;

  const query = {};

  if (action) query.action = action;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (userId) query.user = userId;
  if (resourceType) query['resource.type'] = resourceType;
  
  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const auditLogs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = auditLogs.map(log => ({
      timestamp: log.createdAt,
      user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      userEmail: log.user ? log.user.email : '',
      userRole: log.user ? log.user.role : '',
      action: log.action,
      category: log.category,
      severity: log.severity,
      resourceType: log.resource.type,
      resourceName: log.resource.name,
      description: log.details.description,
      ipAddress: log.details.ipAddress,
      userAgent: log.details.userAgent
    }));

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);

    // Convert to CSV string
    const csvString = [
      // Header row
      ['Timestamp', 'User', 'User Email', 'User Role', 'Action', 'Category', 'Severity', 'Resource Type', 'Resource Name', 'Description', 'IP Address', 'User Agent'].join(','),
      // Data rows
      ...csvData.map(row => [
        row.timestamp,
        `"${row.user}"`,
        `"${row.userEmail}"`,
        `"${row.userRole}"`,
        `"${row.action}"`,
        `"${row.category}"`,
        `"${row.severity}"`,
        `"${row.resourceType}"`,
        `"${row.resourceName}"`,
        `"${row.description}"`,
        `"${row.ipAddress}"`,
        `"${row.userAgent}"`
      ].join(','))
    ].join('\n');

    return res.send(csvString);
  }

  // Default JSON format
  sendSuccessResponse(res, { 
    auditLogs,
    exportInfo: {
      totalRecords: auditLogs.length,
      exportDate: new Date().toISOString(),
      filters: { action, category, severity, userId, resourceType, startDate, endDate }
    }
  });
}));

// @route   DELETE /api/audit/cleanup
// @desc    Clean up old audit logs
// @access  Private/Admin
router.delete('/cleanup', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { days = 90, severity } = req.query;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const query = { createdAt: { $lt: cutoffDate } };
  
  if (severity) {
    query.severity = severity;
  }

  const result = await AuditLog.deleteMany(query);

  // Create audit log for cleanup
  await AuditLog.create({
    user: req.user._id,
    action: 'audit_cleanup',
    resource: {
      type: 'audit',
      id: 'cleanup',
      name: 'Audit Log Cleanup'
    },
    details: {
      description: `Cleaned up ${result.deletedCount} audit logs older than ${days} days`,
      category: 'system',
      severity: 'low',
      ipAddress: req.ip,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate
    }
  });

  sendSuccessResponse(res, { 
    deletedCount: result.deletedCount,
    cutoffDate: cutoffDate
  }, `Successfully cleaned up ${result.deletedCount} audit logs`);
}));

// @route   GET /api/audit/realtime
// @desc    Get real-time audit logs (for monitoring)
// @access  Private/Admin
router.get('/realtime', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const recentLogs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('user', 'firstName lastName email role')
    .populate('resource', 'firstName lastName name email');

  sendSuccessResponse(res, { recentLogs });
}));

module.exports = router; 