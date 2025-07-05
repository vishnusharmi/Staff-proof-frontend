const express = require('express');
const router = express.Router();

// Import models
const Blacklist = require('../Modals/Blacklist');
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole 
} = require('../Middlewares/auth');
const { 
  validateBlacklistEntry 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { SESService, emailTemplates } = require('../Services/awsService');

// @route   GET /api/blacklist
// @desc    Get blacklist entries with filtering
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    reason, 
    status, 
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const query = {};

  if (type) query.type = type;
  if (reason) query.reason = reason;
  if (status) query.status = status;
  
  if (search) {
    query.$or = [
      { 'entity.firstName': { $regex: search, $options: 'i' } },
      { 'entity.lastName': { $regex: search, $options: 'i' } },
      { 'entity.email': { $regex: search, $options: 'i' } },
      { 'entity.name': { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const blacklistEntries = await Blacklist.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('entity', 'firstName lastName email name')
    .populate('addedBy', 'firstName lastName email')
    .populate('removedBy', 'firstName lastName email');

  const total = await Blacklist.countDocuments(query);

  sendSuccessResponse(res, {
    blacklistEntries,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/blacklist/:id
// @desc    Get blacklist entry by ID
// @access  Private/Admin
router.get('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const blacklistEntry = await Blacklist.findById(req.params.id)
    .populate('entity', 'firstName lastName email phone name address')
    .populate('addedBy', 'firstName lastName email')
    .populate('removedBy', 'firstName lastName email');

  if (!blacklistEntry) {
    return sendErrorResponse(res, 404, 'Blacklist entry not found');
  }

  sendSuccessResponse(res, { blacklistEntry });
}));

// @route   POST /api/blacklist
// @desc    Add entity to blacklist
// @access  Private/Admin
router.post('/', authenticateToken, authorizeRole(['Admin']), validateBlacklistEntry, asyncHandler(async (req, res) => {
  const { 
    entityId, 
    entityType, 
    reason, 
    evidence, 
    duration, 
    notes 
  } = req.body;

  // Check if entity exists
  let entity;
  if (entityType === 'user') {
    entity = await User.findById(entityId);
  } else if (entityType === 'company') {
    entity = await Company.findById(entityId);
  }

  if (!entity) {
    return sendErrorResponse(res, 404, `${entityType} not found`);
  }

  // Check if entity is already blacklisted
  const existingEntry = await Blacklist.findOne({
    entity: entityId,
    entityType: entityType,
    status: 'active'
  });

  if (existingEntry) {
    return sendErrorResponse(res, 400, `${entityType} is already blacklisted`);
  }

  // Calculate expiration date
  let expiresAt = null;
  if (duration) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
  }

  const blacklistData = {
    entity: entityId,
    entityType: entityType,
    reason: reason,
    evidence: evidence || [],
    duration: duration,
    expiresAt: expiresAt,
    notes: notes,
    status: 'active',
    addedBy: req.user._id
  };

  const blacklistEntry = await Blacklist.create(blacklistData);

  // Update entity status
  if (entityType === 'user') {
    entity.status = 'suspended';
    await entity.save();
  } else if (entityType === 'company') {
    entity.status = 'suspended';
    await company.save();
  }

  // Populate the created entry
  const populatedEntry = await Blacklist.findById(blacklistEntry._id)
    .populate('entity', 'firstName lastName email name')
    .populate('addedBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'blacklist_add',
    resource: {
      type: 'blacklist',
      id: blacklistEntry._id,
      name: entityType === 'user' ? `${entity.firstName} ${entity.lastName}` : entity.name
    },
    details: {
      description: `${entityType} added to blacklist: ${entityType === 'user' ? entity.firstName : entity.name}`,
      category: 'blacklist_management',
      severity: 'high',
      ipAddress: req.ip,
      reason: reason
    }
  });

  // Send notification email to entity
  try {
    if (entityType === 'user') {
      await SESService.sendEmail(
        entity.email,
        'Account Suspended',
        emailTemplates.accountSuspended.html({
          firstName: entity.firstName,
          reason: reason,
          duration: duration ? `${duration} days` : 'indefinitely'
        })
      );
    } else if (entityType === 'company' && entity.owner) {
      const owner = await User.findById(entity.owner);
      if (owner) {
        await SESService.sendEmail(
          owner.email,
          'Company Account Suspended',
          emailTemplates.companySuspended.html({
            ownerName: owner.firstName,
            companyName: entity.name,
            reason: reason,
            duration: duration ? `${duration} days` : 'indefinitely'
          })
        );
      }
    }
  } catch (emailError) {
    console.error('Failed to send suspension email:', emailError);
  }

  sendSuccessResponse(res, { blacklistEntry: populatedEntry }, 'Entity added to blacklist successfully', 201);
}));

// @route   PUT /api/blacklist/:id
// @desc    Update blacklist entry
// @access  Private/Admin
router.put('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { reason, evidence, duration, notes, status } = req.body;

  const blacklistEntry = await Blacklist.findById(req.params.id);
  if (!blacklistEntry) {
    return sendErrorResponse(res, 404, 'Blacklist entry not found');
  }

  const updateData = {};
  if (reason) updateData.reason = reason;
  if (evidence) updateData.evidence = evidence;
  if (notes) updateData.notes = notes;
  if (status) updateData.status = status;

  // Update duration and expiration
  if (duration) {
    updateData.duration = duration;
    if (duration === 'permanent') {
      updateData.expiresAt = null;
    } else {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
      updateData.expiresAt = expiresAt;
    }
  }

  const updatedEntry = await Blacklist.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('entity', 'firstName lastName email name')
   .populate('addedBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'blacklist_update',
    resource: {
      type: 'blacklist',
      id: blacklistEntry._id,
      name: blacklistEntry.entityType === 'user' ? 
        `${updatedEntry.entity.firstName} ${updatedEntry.entity.lastName}` : 
        updatedEntry.entity.name
    },
    details: {
      description: `Blacklist entry updated`,
      category: 'blacklist_management',
      severity: 'medium',
      ipAddress: req.ip,
      changes: Object.keys(updateData)
    }
  });

  sendSuccessResponse(res, { blacklistEntry: updatedEntry }, 'Blacklist entry updated successfully');
}));

// @route   DELETE /api/blacklist/:id
// @desc    Remove entity from blacklist
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const blacklistEntry = await Blacklist.findById(req.params.id);
  if (!blacklistEntry) {
    return sendErrorResponse(res, 404, 'Blacklist entry not found');
  }

  if (blacklistEntry.status !== 'active') {
    return sendErrorResponse(res, 400, 'Blacklist entry is not active');
  }

  // Update blacklist entry
  blacklistEntry.status = 'removed';
  blacklistEntry.removedBy = req.user._id;
  blacklistEntry.removedAt = new Date();
  blacklistEntry.removalReason = reason;
  await blacklistEntry.save();

  // Update entity status
  if (blacklistEntry.entityType === 'user') {
    const user = await User.findById(blacklistEntry.entity);
    if (user) {
      user.status = 'active';
      await user.save();
    }
  } else if (blacklistEntry.entityType === 'company') {
    const company = await Company.findById(blacklistEntry.entity);
    if (company) {
      company.status = 'active';
      await company.save();
    }
  }

  const updatedEntry = await Blacklist.findById(req.params.id)
    .populate('entity', 'firstName lastName email name')
    .populate('addedBy', 'firstName lastName email')
    .populate('removedBy', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'blacklist_remove',
    resource: {
      type: 'blacklist',
      id: blacklistEntry._id,
      name: blacklistEntry.entityType === 'user' ? 
        `${updatedEntry.entity.firstName} ${updatedEntry.entity.lastName}` : 
        updatedEntry.entity.name
    },
    details: {
      description: `Entity removed from blacklist`,
      category: 'blacklist_management',
      severity: 'medium',
      ipAddress: req.ip,
      reason: reason
    }
  });

  // Send notification email to entity
  try {
    if (blacklistEntry.entityType === 'user') {
      const user = await User.findById(blacklistEntry.entity);
      if (user) {
        await SESService.sendEmail(
          user.email,
          'Account Reinstated',
          emailTemplates.accountReinstated.html({
            firstName: user.firstName,
            reason: reason
          })
        );
      }
    } else if (blacklistEntry.entityType === 'company') {
      const company = await Company.findById(blacklistEntry.entity);
      if (company && company.owner) {
        const owner = await User.findById(company.owner);
        if (owner) {
          await SESService.sendEmail(
            owner.email,
            'Company Account Reinstated',
            emailTemplates.companyReinstated.html({
              ownerName: owner.firstName,
              companyName: company.name,
              reason: reason
            })
          );
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to send reinstatement email:', emailError);
  }

  sendSuccessResponse(res, { blacklistEntry: updatedEntry }, 'Entity removed from blacklist successfully');
}));

// @route   GET /api/blacklist/check/:entityId
// @desc    Check if entity is blacklisted
// @access  Private
router.get('/check/:entityId', authenticateToken, asyncHandler(async (req, res) => {
  const { entityType } = req.query;

  if (!entityType) {
    return sendErrorResponse(res, 400, 'Entity type is required');
  }

  const blacklistEntry = await Blacklist.findOne({
    entity: req.params.entityId,
    entityType: entityType,
    status: 'active'
  }).populate('entity', 'firstName lastName email name');

  if (blacklistEntry) {
    return sendSuccessResponse(res, { 
      isBlacklisted: true, 
      blacklistEntry 
    });
  }

  sendSuccessResponse(res, { isBlacklisted: false });
}));

// @route   GET /api/blacklist/statistics
// @desc    Get blacklist statistics
// @access  Private/Admin
router.get('/statistics/overview', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const [
    totalEntries,
    activeEntries,
    removedEntries,
    userEntries,
    companyEntries,
    expiredEntries
  ] = await Promise.all([
    Blacklist.countDocuments({}),
    Blacklist.countDocuments({ status: 'active' }),
    Blacklist.countDocuments({ status: 'removed' }),
    Blacklist.countDocuments({ entityType: 'user' }),
    Blacklist.countDocuments({ entityType: 'company' }),
    Blacklist.countDocuments({ 
      status: 'active', 
      expiresAt: { $lt: new Date() } 
    })
  ]);

  const statistics = {
    total: totalEntries,
    active: activeEntries,
    removed: removedEntries,
    byType: {
      users: userEntries,
      companies: companyEntries
    },
    expired: expiredEntries,
    removalRate: totalEntries > 0 ? ((removedEntries / totalEntries) * 100).toFixed(2) : 0
  };

  sendSuccessResponse(res, { statistics });
}));

// @route   POST /api/blacklist/bulk-remove
// @desc    Remove multiple entities from blacklist
// @access  Private/Admin
router.post('/bulk-remove', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { entryIds, reason } = req.body;

  if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
    return sendErrorResponse(res, 400, 'Entry IDs array is required');
  }

  if (!reason) {
    return sendErrorResponse(res, 400, 'Removal reason is required');
  }

  const blacklistEntries = await Blacklist.find({
    _id: { $in: entryIds },
    status: 'active'
  });

  if (blacklistEntries.length === 0) {
    return sendErrorResponse(res, 404, 'No active blacklist entries found');
  }

  const updatePromises = blacklistEntries.map(async (entry) => {
    entry.status = 'removed';
    entry.removedBy = req.user._id;
    entry.removedAt = new Date();
    entry.removalReason = reason;
    await entry.save();

    // Update entity status
    if (entry.entityType === 'user') {
      await User.findByIdAndUpdate(entry.entity, { status: 'active' });
    } else if (entry.entityType === 'company') {
      await Company.findByIdAndUpdate(entry.entity, { status: 'active' });
    }

    return entry;
  });

  await Promise.all(updatePromises);

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'blacklist_bulk_remove',
    resource: {
      type: 'blacklist',
      id: 'bulk',
      name: `Bulk removal - ${blacklistEntries.length} entries`
    },
    details: {
      description: `Bulk removal of ${blacklistEntries.length} blacklist entries`,
      category: 'blacklist_management',
      severity: 'medium',
      ipAddress: req.ip,
      reason: reason
    }
  });

  sendSuccessResponse(res, { 
    removedCount: blacklistEntries.length 
  }, `${blacklistEntries.length} entities removed from blacklist successfully`);
}));

module.exports = router; 