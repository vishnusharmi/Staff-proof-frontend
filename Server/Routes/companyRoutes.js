const express = require('express');
const router = express.Router();

// Import models
const Company = require('../Modals/Company');
const User = require('../Modals/User');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole, 
  authorizeCompanyAccess 
} = require('../Middlewares/auth');
const { 
  validateCompanyCreation, 
  validateCompanyUpdate 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { S3Service, SESService, emailTemplates } = require('../Services/awsService');

// @route   GET /api/companies
// @desc    Get all companies (Admin only)
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const companies = await Company.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('owner', 'firstName lastName email')
    .populate('employees', 'firstName lastName email role status');

  const total = await Company.countDocuments(query);

  sendSuccessResponse(res, {
    companies,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private
router.get('/:id', authenticateToken, authorizeCompanyAccess, asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('owner', 'firstName lastName email phone')
    .populate('employees', 'firstName lastName email role status employeeId designation department')
    .populate('verificationCases', 'status priority createdAt');

  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  sendSuccessResponse(res, { company });
}));

// @route   POST /api/companies
// @desc    Create a new company
// @access  Private/Admin
router.post('/', authenticateToken, authorizeRole(['Admin']), validateCompanyCreation, asyncHandler(async (req, res) => {
  const { name, website, ownerId } = req.body;

  // Verify owner exists and is an Employer
  if (ownerId) {
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'Employer') {
      return sendErrorResponse(res, 400, 'Owner must be an Employer');
    }
  }

  const companyData = {
    name,
    website,
    status: 'active'
  };

  if (ownerId) {
    companyData.owner = ownerId;
  }

  const company = await Company.create(companyData);

  // Update owner's company reference
  if (ownerId) {
    await User.findByIdAndUpdate(ownerId, { company: company._id });
  }

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'company_create',
    resource: {
      type: 'company',
      id: company._id,
      name: company.name
    },
    details: {
      description: `New company created: ${company.name}`,
      category: 'company_management',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  // Send notification email to owner
  if (ownerId) {
    try {
      const owner = await User.findById(ownerId);
      await SESService.sendEmail(
        owner.email,
        'Company Account Created',
        emailTemplates.companyCreated.html({
          companyName: company.name,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          companyName: company.name
        })
      );
    } catch (emailError) {
      console.error('Failed to send company creation email:', emailError);
    }
  }

  sendSuccessResponse(res, { company }, 'Company created successfully', 201);
}));

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private
router.put('/:id', authenticateToken, authorizeCompanyAccess, validateCompanyUpdate, asyncHandler(async (req, res) => {
  const { name, website, status } = req.body;

  const company = await Company.findById(req.params.id);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (website) updateData.website = website;
  if (status && req.user.role === 'Admin') updateData.status = status;

  const updatedCompany = await Company.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('owner', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'company_update',
    resource: {
      type: 'company',
      id: company._id,
      name: company.name
    },
    details: {
      description: `Company updated: ${company.name}`,
      category: 'company_management',
      severity: 'low',
      ipAddress: req.ip,
      changes: Object.keys(updateData)
    }
  });

  sendSuccessResponse(res, { company: updatedCompany }, 'Company updated successfully');
}));

// @route   DELETE /api/companies/:id
// @desc    Delete company (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  // Check if company has employees
  const employeeCount = await User.countDocuments({ company: req.params.id });
  if (employeeCount > 0) {
    return sendErrorResponse(res, 400, 'Cannot delete company with active employees');
  }

  // Check if company has verification cases
  const caseCount = await require('../Modals/VerificationCase').countDocuments({ company: req.params.id });
  if (caseCount > 0) {
    return sendErrorResponse(res, 400, 'Cannot delete company with active verification cases');
  }

  await Company.findByIdAndDelete(req.params.id);

  // Update owner's company reference
  if (company.owner) {
    await User.findByIdAndUpdate(company.owner, { $unset: { company: 1 } });
  }

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'company_delete',
    resource: {
      type: 'company',
      id: company._id,
      name: company.name
    },
    details: {
      description: `Company deleted: ${company.name}`,
      category: 'company_management',
      severity: 'high',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, null, 'Company deleted successfully');
}));

// @route   GET /api/companies/:id/employees
// @desc    Get company employees
// @access  Private
router.get('/:id/employees', authenticateToken, authorizeCompanyAccess, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status, search } = req.query;

  const query = { company: req.params.id };
  
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const employees = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  sendSuccessResponse(res, {
    employees,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// @route   POST /api/companies/:id/employees
// @desc    Add employee to company
// @access  Private
router.post('/:id/employees', authenticateToken, authorizeCompanyAccess, asyncHandler(async (req, res) => {
  const { userId, employeeId, designation, department, joiningDate } = req.body;

  const company = await Company.findById(req.params.id);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  if (user.role !== 'Employee') {
    return sendErrorResponse(res, 400, 'User must have Employee role');
  }

  if (user.company && user.company.toString() !== req.params.id) {
    return sendErrorResponse(res, 400, 'User is already associated with another company');
  }

  // Check if employeeId is unique within the company
  if (employeeId) {
    const existingEmployee = await User.findOne({ 
      company: req.params.id, 
      employeeId,
      _id: { $ne: userId }
    });
    if (existingEmployee) {
      return sendErrorResponse(res, 400, 'Employee ID already exists in this company');
    }
  }

  const updateData = {
    company: req.params.id,
    role: 'Employee'
  };

  if (employeeId) updateData.employeeId = employeeId;
  if (designation) updateData.designation = designation;
  if (department) updateData.department = department;
  if (joiningDate) updateData.joiningDate = joiningDate;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'employee_add',
    resource: {
      type: 'user',
      id: updatedUser._id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`
    },
    details: {
      description: `Employee added to company: ${updatedUser.firstName} ${updatedUser.lastName} -> ${company.name}`,
      category: 'employee_management',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, { employee: updatedUser }, 'Employee added to company successfully');
}));

// @route   DELETE /api/companies/:id/employees/:employeeId
// @desc    Remove employee from company
// @access  Private
router.delete('/:id/employees/:employeeId', authenticateToken, authorizeCompanyAccess, asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.employeeId);
  if (!employee || employee.company?.toString() !== req.params.id) {
    return sendErrorResponse(res, 404, 'Employee not found in this company');
  }

  const company = await Company.findById(req.params.id);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  // Remove employee from company
  await User.findByIdAndUpdate(req.params.employeeId, {
    $unset: { company: 1, employeeId: 1, designation: 1, department: 1, joiningDate: 1 }
  });

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'employee_remove',
    resource: {
      type: 'user',
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`
    },
    details: {
      description: `Employee removed from company: ${employee.firstName} ${employee.lastName} <- ${company.name}`,
      category: 'employee_management',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, null, 'Employee removed from company successfully');
}));

// @route   GET /api/companies/:id/statistics
// @desc    Get company statistics
// @access  Private
router.get('/:id/statistics', authenticateToken, authorizeCompanyAccess, asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company not found');
  }

  const [
    totalEmployees,
    activeEmployees,
    pendingEmployees,
    verificationCases,
    pendingCases,
    completedCases
  ] = await Promise.all([
    User.countDocuments({ company: req.params.id, role: 'Employee' }),
    User.countDocuments({ company: req.params.id, role: 'Employee', status: 'active' }),
    User.countDocuments({ company: req.params.id, role: 'Employee', status: 'pending' }),
    require('../Modals/VerificationCase').countDocuments({ company: req.params.id }),
    require('../Modals/VerificationCase').countDocuments({ company: req.params.id, status: 'pending' }),
    require('../Modals/VerificationCase').countDocuments({ company: req.params.id, status: 'completed' })
  ]);

  const statistics = {
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      pending: pendingEmployees
    },
    verifications: {
      total: verificationCases,
      pending: pendingCases,
      completed: completedCases
    }
  };

  sendSuccessResponse(res, { statistics });
}));

// @route   GET /api/companies/profile
// @desc    Get current user's company profile
// @access  Private (Employer)
router.get('/profile', authenticateToken, authorizeRole(['Employer']), asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.company)
    .populate('owner', 'firstName lastName email phone')
    .populate('employees', 'firstName lastName email role status employeeId designation department');

  if (!company) {
    return sendErrorResponse(res, 404, 'Company profile not found');
  }

  sendSuccessResponse(res, { company });
}));

// @route   PUT /api/companies/profile
// @desc    Update current user's company profile
// @access  Private (Employer)
router.put('/profile', authenticateToken, authorizeRole(['Employer']), validateCompanyUpdate, asyncHandler(async (req, res) => {
  const { name, website } = req.body;

  const company = await Company.findById(req.user.company);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company profile not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (website) updateData.website = website;

  const updatedCompany = await Company.findByIdAndUpdate(
    req.user.company,
    updateData,
    { new: true, runValidators: true }
  ).populate('owner', 'firstName lastName email');

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'company_profile_update',
    resource: {
      type: 'company',
      id: updatedCompany._id,
      name: updatedCompany.name
    },
    details: {
      description: `Company profile updated: ${updatedCompany.name}`,
      category: 'company_management',
      severity: 'medium',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, { company: updatedCompany }, 'Company profile updated successfully');
}));

// @route   POST /api/companies/documents/upload
// @desc    Upload company document
// @access  Private (Employer)
router.post('/documents/upload', authenticateToken, authorizeRole(['Employer']), asyncHandler(async (req, res) => {
  const { document, type } = req.body;

  const company = await Company.findById(req.user.company);
  if (!company) {
    return sendErrorResponse(res, 404, 'Company profile not found');
  }

  // Here you would typically upload the document to S3
  // For now, we'll just return a mock response
  const documentData = {
    id: Date.now().toString(),
    name: document.name || 'document.pdf',
    type: type,
    url: 'https://example.com/document.pdf',
    uploadedAt: new Date()
  };

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'company_document_upload',
    resource: {
      type: 'company',
      id: company._id,
      name: company.name
    },
    details: {
      description: `Company document uploaded: ${documentData.name}`,
      category: 'document_management',
      severity: 'low',
      ipAddress: req.ip
    }
  });

  sendSuccessResponse(res, { document: documentData }, 'Document uploaded successfully');
}));

module.exports = router; 