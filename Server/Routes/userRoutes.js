const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole, 
  authorizeEmployeeAccess 
} = require('../Middlewares/auth');
const { 
  validateProfileUpdate, 
  validateIdParam, 
  validatePagination, 
  validateSearch 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { S3Service, uploadSingle } = require('../Services/awsService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = `uploads/users/${req.body.role || 'temp'}`;
    try {
      await require('fs').promises.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// @route   GET /api/users
// @desc    Get all users (with pagination and filters)
// @access  Private (Admin only)
router.get('/', authenticateToken, authorizeRole('Admin'), validatePagination, validateSearch, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', q, filters } = req.query;
  
  // Build query
  const query = {};
  
  // Search functionality
  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { employeeId: { $regex: q, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters) {
    const filterObj = JSON.parse(filters);
    Object.keys(filterObj).forEach(key => {
      if (filterObj[key] !== undefined && filterObj[key] !== '') {
        query[key] = filterObj[key];
      }
    });
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Execute query
  const users = await User.find(query)
    .populate('company', 'name')
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await User.countDocuments(query);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  sendSuccessResponse(res, {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      total,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    }
  }, 'Users retrieved successfully');
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin, or user accessing their own profile)
router.get('/:id', authenticateToken, validateIdParam, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user can access this profile
  if (req.user.role !== 'Admin' && req.user._id.toString() !== id) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  const user = await User.findById(id)
    .populate('company', 'name')
    .select('-password');
  
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }
  
  sendSuccessResponse(res, { user }, 'User retrieved successfully');
}));

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', authenticateToken, authorizeRole('Admin'), asyncHandler(async (req, res) => {
  const userData = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return sendErrorResponse(res, 400, 'User with this email already exists');
  }
  
  // Verify company exists if provided
  if (userData.company) {
    const company = await Company.findById(userData.company);
    if (!company) {
      return sendErrorResponse(res, 400, 'Company not found');
    }
  }
  
  // Create user
  const user = await User.create(userData);
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'user_create',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `Admin created new user: ${user.firstName} ${user.lastName} (${user.role})`,
      category: 'data_modification',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
  
  // Remove password from response
  user.password = undefined;
  
  sendSuccessResponse(res, { user }, 'User created successfully', 201);
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, or user updating their own profile)
router.put('/:id', authenticateToken, validateIdParam, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Check if user can update this profile
  if (req.user.role !== 'Admin' && req.user._id.toString() !== id) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  // Find user
  const user = await User.findById(id);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }
  
  // Store original data for audit log
  const originalData = user.toObject();
  
  // Update user
  Object.keys(updateData).forEach(key => {
    if (key !== 'password' && key !== 'email') { // Prevent password and email updates through this route
      user[key] = updateData[key];
    }
  });
  
  await user.save();
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'user_update',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `User updated: ${user.firstName} ${user.lastName}`,
      category: 'data_modification',
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    changes: {
      before: originalData,
      after: user.toObject(),
      fields: Object.keys(updateData)
    }
  });
  
  // Remove password from response
  user.password = undefined;
  
  sendSuccessResponse(res, { user }, 'User updated successfully');
}));

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('Admin'), validateIdParam, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === id) {
    return sendErrorResponse(res, 400, 'Cannot delete your own account');
  }
  
  const user = await User.findById(id);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }
  
  // Store user data for audit log
  const userData = user.toObject();
  
  // Delete user
  await User.findByIdAndDelete(id);
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'user_delete',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `User deleted: ${user.firstName} ${user.lastName} (${user.role})`,
      category: 'data_modification',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    changes: {
      before: userData,
      after: null,
      fields: ['deleted']
    }
  });
  
  sendSuccessResponse(res, null, 'User deleted successfully');
}));

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('company', 'name')
    .select('-password');
  
  sendSuccessResponse(res, { user }, 'Profile retrieved successfully');
}));

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, asyncHandler(async (req, res) => {
  const updateData = req.body;
  
  // Store original data for audit log
  const originalData = req.user.toObject();
  
  // Update allowed fields only
  const allowedFields = [
    'firstName', 'lastName', 'middleName', 'fatherName', 'phone', 'dateOfBirth', 'gender', 'address', 'preferences',
    'designation', 'department', 'joiningDate', 'endDate', 'employmentType', 'salary', 'badge',
    'pan', 'aadhaar', 'qualification', 'experience', 'education'
  ];
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      req.user[key] = updateData[key];
    }
  });
  
  await req.user.save();
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'user_update',
    resource: {
      type: 'user',
      id: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`
    },
    details: {
      description: `Profile updated: ${req.user.firstName} ${req.user.lastName}`,
      category: 'data_modification',
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    changes: {
      before: originalData,
      after: req.user.toObject(),
      fields: Object.keys(updateData).filter(key => allowedFields.includes(key))
    }
  });
  
  // Remove password from response
  req.user.password = undefined;
  
  sendSuccessResponse(res, { user: req.user }, 'Profile updated successfully');
}));

// @route   POST /api/users/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/profile/avatar', authenticateToken, asyncHandler(async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return sendErrorResponse(res, 400, err.message);
    }
    
    if (!req.file) {
      return sendErrorResponse(res, 400, 'No file uploaded');
    }
    
    try {
      // Delete old profile picture if exists
      if (req.user.profilePicture) {
        await S3Service.deleteFile(req.user.profilePicture);
      }
      
      // Update user profile picture
      req.user.profilePicture = req.file.key;
      await req.user.save();
      
      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        action: 'user_update',
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        details: {
          description: `Profile picture updated: ${req.user.firstName} ${req.user.lastName}`,
          category: 'data_modification',
          severity: 'low',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
      
      sendSuccessResponse(res, { 
        profilePicture: req.file.key,
        url: req.file.location 
      }, 'Profile picture uploaded successfully');
    } catch (error) {
      return sendErrorResponse(res, 500, 'Failed to upload profile picture');
    }
  });
}));

// @route   GET /api/users/company/:companyId
// @desc    Get users by company
// @access  Private (Admin, or users from same company)
router.get('/company/:companyId', authenticateToken, validateIdParam, validatePagination, asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { page = 1, limit = 10, role } = req.query;
  
  // Check if user can access this company's users
  if (req.user.role !== 'Admin' && req.user.company?.toString() !== companyId) {
    return sendErrorResponse(res, 403, 'Access denied');
  }
  
  // Build query
  const query = { company: companyId };
  if (role) {
    query.role = role;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await User.countDocuments(query);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  
  sendSuccessResponse(res, {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      total,
      limit: parseInt(limit)
    }
  }, 'Company users retrieved successfully');
}));

// @route   PUT /api/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/:id/status', authenticateToken, authorizeRole('Admin'), validateIdParam, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
    return sendErrorResponse(res, 400, 'Invalid status');
  }
  
  const user = await User.findById(id);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }
  
  // Store original status for audit log
  const originalStatus = user.status;
  
  // Update status
  user.status = status;
  await user.save();
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'user_status_change',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `User status changed from ${originalStatus} to ${status}: ${user.firstName} ${user.lastName}`,
      category: 'data_modification',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    changes: {
      before: { status: originalStatus },
      after: { status },
      fields: ['status']
    }
  });
  
  sendSuccessResponse(res, { user }, 'User status updated successfully');
}));

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/:id/role', authenticateToken, authorizeRole('Admin'), validateIdParam, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['Admin', 'Employer', 'Employee', 'Verifier'].includes(role)) {
    return sendErrorResponse(res, 400, 'Invalid role');
  }
  
  const user = await User.findById(id);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }
  
  // Store original role for audit log
  const originalRole = user.role;
  
  // Update role
  user.role = role;
  await user.save();
  
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'role_change',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `User role changed from ${originalRole} to ${role}: ${user.firstName} ${user.lastName}`,
      category: 'data_modification',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    changes: {
      before: { role: originalRole },
      after: { role },
      fields: ['role']
    }
  });
  
  sendSuccessResponse(res, { user }, 'User role updated successfully');
}));

// ===== JOB HISTORY ENDPOINTS =====
// @route   GET /api/users/job-history
// @desc    Get all job history records for the logged-in user
// @access  Private (Employee)
router.get('/job-history', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('jobHistory');
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  return sendSuccessResponse(res, 200, 'Job history retrieved', { data: user.jobHistory || [] });
}));

// @route   POST /api/users/job-history
// @desc    Add a job history record
// @access  Private (Employee)
router.post('/job-history', authenticateToken, asyncHandler(async (req, res) => {
  const { company, position, startDate, endDate, description } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  const newRecord = {
    _id: new mongoose.Types.ObjectId(),
    company,
    position,
    startDate,
    endDate,
    description
  };
  user.jobHistory.push(newRecord);
  await user.save();
  return sendSuccessResponse(res, 201, 'Job record added', { data: newRecord });
}));

// @route   DELETE /api/users/job-history/:id
// @desc    Delete a job history record
// @access  Private (Employee)
router.delete('/job-history/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  user.jobHistory = user.jobHistory.filter(j => j._id.toString() !== id);
  await user.save();
  return sendSuccessResponse(res, 200, 'Job record deleted');
}));

// ===== DOCUMENTS ENDPOINTS =====
const memoryUpload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/users/documents
// @desc    Get all documents for the logged-in user
// @access  Private (Employee)
router.get('/documents', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('documents');
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  return sendSuccessResponse(res, 200, 'Documents retrieved', { data: user.documents || [] });
}));

// @route   POST /api/users/documents/upload
// @desc    Upload a new document
// @access  Private (Employee)
router.post('/documents/upload', authenticateToken, memoryUpload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return sendErrorResponse(res, 400, 'No file uploaded');
  const user = await User.findById(req.user._id);
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  // Store in S3 if available, else in MongoDB
  let fileUrl = null;
  let s3Key = null;
  if (typeof S3Service?.uploadFile === 'function') {
    const s3Result = await S3Service.uploadFile(req.file);
    fileUrl = s3Result.Location;
    s3Key = s3Result.Key;
  }
  const newDoc = {
    _id: new mongoose.Types.ObjectId(),
    name: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date(),
    url: fileUrl,
    s3Key,
    data: !fileUrl ? req.file.buffer.toString('base64') : undefined
  };
  user.documents.push(newDoc);
  await user.save();
  return sendSuccessResponse(res, 201, 'Document uploaded', { data: newDoc });
}));

// @route   DELETE /api/users/documents/:id
// @desc    Delete a document
// @access  Private (Employee)
router.delete('/documents/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  const doc = user.documents.find(d => d._id.toString() === id);
  if (!doc) return sendErrorResponse(res, 404, 'Document not found');
  // Delete from S3 if present
  if (doc.s3Key && typeof S3Service?.deleteFile === 'function') {
    await S3Service.deleteFile(doc.s3Key);
  }
  user.documents = user.documents.filter(d => d._id.toString() !== id);
  await user.save();
  return sendSuccessResponse(res, 200, 'Document deleted');
}));

// @route   GET /api/users/documents/:id/content
// @desc    Download/view a document
// @access  Private (Employee)
router.get('/documents/:id/content', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return sendErrorResponse(res, 404, 'User not found');
  const doc = user.documents.find(d => d._id.toString() === id);
  if (!doc) return sendErrorResponse(res, 404, 'Document not found');
  if (doc.url) {
    // S3 or external URL
    return res.redirect(doc.url);
  } else if (doc.data) {
    // MongoDB base64
    const buffer = Buffer.from(doc.data, 'base64');
    res.set('Content-Type', doc.mimetype);
    res.set('Content-Disposition', `inline; filename=\"${doc.name}\"`);
    return res.send(buffer);
  } else {
    return sendErrorResponse(res, 404, 'No document data found');
  }
}));

// @route   POST /api/users/register
// @desc    Register a new user with form data and files (Employee, Employer, Verifier, Admin)
// @access  Public
router.post('/register', upload.fields([
  { name: 'resume', maxCount: 5 },
  { name: 'certificates', maxCount: 10 },
  { name: 'governmentID', maxCount: 5 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'panCertificate', maxCount: 5 },
  { name: 'gstCertificate', maxCount: 5 },
  { name: 'cinCertificate', maxCount: 5 },
  { name: 'otherDocuments', maxCount: 10 },
  // New employee management file fields
  { name: 'aadharCard', maxCount: 5 },
  { name: 'panCard', maxCount: 5 },
  { name: 'offerLetter', maxCount: 5 },
  { name: 'educationCertificate', maxCount: 5 },
  // Certificates (multiple files)
  { name: 'certificates', maxCount: 20 }
]), asyncHandler(async (req, res) => {
  try {
    const { userType, formData } = req.body;
    
    if (!userType || !['employee', 'company', 'verifier', 'admin', 'employer_employee'].includes(userType)) {
      return sendErrorResponse(res, 400, 'Invalid user type');
    }

    // Parse form data
    let parsedFormData;
    try {
      parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;
    } catch (parseError) {
      return sendErrorResponse(res, 400, 'Invalid form data format');
    }

    // Check for existing user with same email
    let existingEmail;
    if (userType === 'employee') {
      existingEmail = parsedFormData.employee?.basic?.email;
    } else if (userType === 'company') {
      existingEmail = parsedFormData.company?.hrEmail;
    } else if (userType === 'verifier') {
      existingEmail = parsedFormData.verifier?.basic?.email;
    } else if (userType === 'admin') {
      existingEmail = parsedFormData.admin?.basic?.email;
    } else if (userType === 'employer_employee') {
      existingEmail = parsedFormData.employee?.email;
    }

    if (existingEmail) {
      const existingUser = await User.findOne({ email: existingEmail });
      if (existingUser) {
        return sendErrorResponse(res, 400, 'User with this email already exists');
      }
    }

    // Process uploaded files
    const processedDocuments = {
      resume: [],
      certificates: [],
      governmentID: [],
      panCertificate: [],
      gstCertificate: [],
      cinCertificate: [],
      otherDocuments: [],
      // New employee management document fields
      aadharCard: [],
      panCard: [],
      offerLetter: [],
      certificates: []
    };

    let profilePictureUrl = null;

    if (req.files) {
      // Process employee files
      if (userType === 'employee' || userType === 'employer_employee') {
        if (req.files.resume) {
          processedDocuments.resume = req.files.resume.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.certificates) {
          processedDocuments.certificates = req.files.certificates.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.governmentID) {
          processedDocuments.governmentID = req.files.governmentID.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        // Add new document types for employee management
        if (req.files.aadharCard) {
          processedDocuments.aadharCard = req.files.aadharCard.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.panCard) {
          processedDocuments.panCard = req.files.panCard.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.offerLetter) {
          processedDocuments.offerLetter = req.files.offerLetter.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.educationCertificate) {
          processedDocuments.educationCertificate = req.files.educationCertificate.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
        
        if (req.files.certificates) {
          processedDocuments.certificates = req.files.certificates.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/employee/${file.filename}`
          }));
        }
      }

      // Process company files
      if (userType === 'company') {
        if (req.files.panCertificate) {
          processedDocuments.panCertificate = req.files.panCertificate.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/company/${file.filename}`
          }));
        }
        
        if (req.files.gstCertificate) {
          processedDocuments.gstCertificate = req.files.gstCertificate.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/company/${file.filename}`
          }));
        }
        
        if (req.files.cinCertificate) {
          processedDocuments.cinCertificate = req.files.cinCertificate.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/company/${file.filename}`
          }));
        }
        
        if (req.files.otherDocuments) {
          processedDocuments.otherDocuments = req.files.otherDocuments.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/users/company/${file.filename}`
          }));
        }
      }

      // Process profile picture for verifier/admin
      if (userType === 'verifier' || userType === 'admin') {
        if (req.files.profilePicture) {
          const file = req.files.profilePicture[0];
          profilePictureUrl = `/uploads/users/${userType}/${file.filename}`;
        }
      }
    }

    // Create user data
    let userData = {
      role: userType === 'employee' || userType === 'employer_employee' ? 'Employee' : 
            userType === 'company' ? 'Employer' : 
            userType === 'verifier' ? 'Verifier' : 'Admin',
      status: userType === 'verifier' || userType === 'admin' ? 'active' : 
              userType === 'employer_employee' ? 'active' : 'pending',
      documents: processedDocuments,
      profilePicture: profilePictureUrl,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (userType === 'employee') {
      const emp = parsedFormData.employee;
      
      // Generate StaffProof ID
      let staffProofId;
      do {
        staffProofId = 'SP-' + Math.floor(Math.random() * 900000) + 100000;
      } while (await User.findOne({ staffProofId }));
      
      // Generate employee ID
      let employeeId;
      do {
        employeeId = 'EMP' + Math.floor(Math.random() * 900000) + 100000;
      } while (await User.findOne({ employeeId }));
      
      userData = {
        ...userData,
        firstName: emp.basic.fullName.split(' ')[0] || emp.basic.fullName,
        middleName: emp.basic.middleName || '',
        lastName: emp.basic.fullName.split(' ').slice(1).join(' ') || '',
        fatherName: emp.basic.fatherName || '',
        email: emp.basic.email,
        phone: emp.basic.phone,
        dateOfBirth: emp.basic.dob,
        gender: emp.basic.gender?.toLowerCase(),
        pan: emp.basic.pan,
        aadhaar: emp.basic.aadhaar,
        staffProofId,
        employeeId,
        designation: emp.currentPosition || '',
        department: emp.currentDepartment || '',
        joiningDate: emp.joiningDate || new Date(),
        endDate: emp.endDate || null,
        employmentType: emp.employmentType || 'full-time',
        salary: emp.salary || 0,
        badge: emp.badge || 'Basic',
        education: {
          degree: emp.education?.degree || emp.education?.qualification || '',
          institution: emp.education?.institution || '',
          fieldOfStudy: emp.education?.fieldOfStudy || '',
          grade: emp.education?.grade || '',
          startDate: emp.education?.startDate || '',
          endDate: emp.education?.endDate || '',
          certificate: processedDocuments.educationCertificate?.[0] || null
        },
        experience: parseInt(emp.education?.experience) || 0,
        jobHistory: emp.jobs?.map(job => ({
          companyName: job.companyName,
          designation: job.designation,
          startDate: job.startDate,
          endDate: job.endDate,
          location: job.location
        })) || [],
        // Generate a temporary password
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      };
    } else if (userType === 'employer_employee') {
      // Handle employee creation by employer with flat data structure
      const emp = parsedFormData.employee;
      
      // Generate StaffProof ID
      let staffProofId;
      do {
        staffProofId = 'SP-' + Math.floor(Math.random() * 900000) + 100000;
      } while (await User.findOne({ staffProofId }));
      
      // Generate employee ID
      let employeeId;
      do {
        employeeId = 'EMP' + Math.floor(Math.random() * 900000) + 100000;
      } while (await User.findOne({ employeeId }));
      
      userData = {
        ...userData,
        firstName: emp.firstName || '',
        middleName: emp.middleName || '',
        lastName: emp.lastName || '',
        fatherName: emp.fatherName || '',
        email: emp.email,
        phone: emp.phone,
        dateOfBirth: emp.dateOfBirth,
        gender: emp.gender?.toLowerCase(),
        address: parsedFormData.address || '',
        staffProofId,
        employeeId,
        designation: emp.designation || '',
        department: emp.department || '',
        joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : new Date(),
        endDate: emp.endDate ? new Date(emp.endDate) : null,
        employmentType: emp.employmentType || 'full-time',
        salary: emp.salary || 0,
        badge: 'Basic',
        education: {
          degree: emp.education?.degree || '',
          institution: emp.education?.institution || '',
          fieldOfStudy: emp.education?.fieldOfStudy || '',
          grade: emp.education?.grade || '',
          startDate: emp.education?.startDate || '',
          endDate: emp.education?.endDate || '',
          certificate: processedDocuments.educationCertificate?.[0] || null
        },
        certificates: parsedFormData.certificates?.map((cert, index) => ({
          name: cert.name || '',
          institution: cert.institution || '',
          issueDate: cert.issueDate || '',
          expiryDate: cert.expiryDate || '',
          file: processedDocuments.certificates?.[index] || null
        })) || [],
        experience: 0,
        jobHistory: [],
        password: parsedFormData.password, // Use the password from the generated field
        company: req.user?.company // Set company from authenticated employer
      };
    } else if (userType === 'company') {
      const comp = parsedFormData.company;
      
      // Create company first
      const companyData = {
        name: comp.name,
        website: comp.website,
        // Required business identifiers
        pan: comp.pan,
        gst: comp.gst,
        cin: comp.cin,
        // Required authorized person information
        authorizedPersonName: comp.hrName,
        authorizedPersonEmail: comp.hrEmail,
        authorizedPersonContact: comp.hrPhone,
        // Company details
        name: comp.name,
        website: comp.website,
        status: 'pending',
        isVerified: false
      };
      
      const company = await Company.create(companyData);
      
      userData = {
        ...userData,
        firstName: comp.hrName.split(' ')[0] || comp.hrName,
        lastName: comp.hrName.split(' ').slice(1).join(' ') || '',
        email: comp.hrEmail,
        phone: comp.hrPhone,
        company: company._id, // Reference to the created company
        // Generate a temporary password
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      };
    } else if (userType === 'verifier') {
      const ver = parsedFormData.verifier;
      userData = {
        ...userData,
        firstName: ver.basic.fullName.split(' ')[0] || ver.basic.fullName,
        lastName: ver.basic.fullName.split(' ').slice(1).join(' ') || '',
        email: ver.basic.email,
        phone: ver.basic.phone || '',
        // Generate a temporary password
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      };
    } else if (userType === 'admin') {
      const adm = parsedFormData.admin;
      userData = {
        ...userData,
        firstName: adm.basic.fullName.split(' ')[0] || adm.basic.fullName,
        lastName: adm.basic.fullName.split(' ').slice(1).join(' ') || '',
        email: adm.basic.email,
        phone: adm.basic.phone || '',
        // Generate a temporary password
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      };
    }

    const user = await User.create(userData);

    // Create audit log
    await AuditLog.create({
      action: userType === 'employer_employee' ? 'employee_create' : 'user_registration',
      resource: {
        type: 'user',
        id: user._id,
        name: `${user.firstName} ${user.lastName}`
      },
      details: {
        description: userType === 'employer_employee' 
          ? `Employer created new employee: ${user.firstName} ${user.lastName}`
          : `New ${userType} registration: ${user.firstName} ${user.lastName}`,
        category: userType === 'employer_employee' ? 'data_modification' : 'registration',
        severity: userType === 'employer_employee' ? 'medium' : 'low',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    sendSuccessResponse(res, {
      userId: user._id,
      status: user.status,
      message: userType === 'employer_employee' ? 'Employee created successfully' : 'Registration submitted successfully'
    }, userType === 'employer_employee' 
      ? 'Employee created successfully' 
      : 'Registration submitted successfully. We will review your information and contact you soon.', 201);

  } catch (error) {
    // Clean up uploaded files if registration fails
    if (req.files) {
      for (const fieldName in req.files) {
        for (const file of req.files[fieldName]) {
          try {
            await require('fs').promises.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete file:', unlinkError);
          }
        }
      }
    }
    throw error;
  }
}));

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private (Admin only, or user updating their own profile)
router.put('/:id', authenticateToken, validateIdParam, upload.single('profilePicture'), asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can update this profile
    if (req.user.role !== 'Admin' && req.user._id.toString() !== id) {
      return sendErrorResponse(res, 403, 'Access denied');
    }
    
    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/users/${user.role.toLowerCase()}/${req.file.filename}`;
    }
    
    // Hash password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      updateData.passwordChangedAt = Date.now() - 1000;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'user_update',
      resource: {
        type: 'user',
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`
      },
      details: {
        description: `User updated: ${updatedUser.firstName} ${updatedUser.lastName}`,
        category: 'data_modification',
        severity: 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    sendSuccessResponse(res, { user: updatedUser }, 'User updated successfully');
    
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await require('fs').promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    throw error;
  }
}));

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('Admin'), validateIdParam, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Prevent deletion of admin users
    if (user.role === 'Admin') {
      return sendErrorResponse(res, 403, 'Cannot delete admin users');
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'user_delete',
      resource: {
        type: 'user',
        id: user._id,
        name: `${user.firstName} ${user.lastName}`
      },
      details: {
        description: `User deleted: ${user.firstName} ${user.lastName} (${user.role})`,
        category: 'data_modification',
        severity: 'high',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    sendSuccessResponse(res, {}, 'User deleted successfully');
    
  } catch (error) {
    throw error;
  }
}));

module.exports = router; 