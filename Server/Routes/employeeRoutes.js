const express = require('express');
const router = express.Router();
const User = require('../Modals/User');
const { authenticateToken } = require('../Middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/employees/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!'));
    }
  }
});

// Configure multer for multiple file uploads
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 20 // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!'));
    }
  }
});

// Generate StaffProof ID
const generateStaffProofId = () => {
  const prefix = 'SP-';
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return prefix + randomNum;
};

// Generate Employee ID
const generateEmployeeId = () => {
  const prefix = 'EMP';
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return prefix + randomNum;
};

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Employee routes are working' });
});

// Get all employees for an employer
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', badge = '' } = req.query;
    
    // Build query
    const query = { role: 'Employee' };
    
    // If user is employer, only show their employees
    if (req.user.role === 'Employer') {
      query.company = req.user.company;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { staffProofId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add badge filter
    if (badge) {
      query.badge = badge;
    }
    
    const skip = (page - 1) * limit;
    
    const employees = await User.find(query)
      .select('-password')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// Update employee
router.put('/employees/:id', authenticateToken, uploadMultiple.fields([
  { name: 'resume', maxCount: 5 },
  { name: 'aadharCard', maxCount: 5 },
  { name: 'panCard', maxCount: 5 },
  { name: 'offerLetter', maxCount: 5 },
  { name: 'educationCertificate', maxCount: 5 },
  { name: 'certificates', maxCount: 20 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if user has permission to update this employee
    if (req.user.role === 'Employer' && employee.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Process uploaded files
    const processedDocuments = {
      resume: [],
      aadharCard: [],
      panCard: [],
      offerLetter: [],
      educationCertificate: [],
      certificates: []
    };
    
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        processedDocuments[fieldName] = req.files[fieldName].map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/employees/${file.filename}`
        }));
      });
    }
    
    // Parse form data
    const updateData = {};
    
    // Basic fields
    ['firstName', 'middleName', 'lastName', 'fatherName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'department', 'designation', 'joiningDate', 'endDate', 'employmentType', 'salary'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Education fields
    if (req.body['education[degree]'] || req.body['education[institution]'] || req.body['education[fieldOfStudy]'] || req.body['education[grade]'] || req.body['education[startDate]'] || req.body['education[endDate]']) {
      updateData.education = {
        degree: req.body['education[degree]'] || employee.education?.degree || '',
        institution: req.body['education[institution]'] || employee.education?.institution || '',
        fieldOfStudy: req.body['education[fieldOfStudy]'] || employee.education?.fieldOfStudy || '',
        grade: req.body['education[grade]'] || employee.education?.grade || '',
        startDate: req.body['education[startDate]'] || employee.education?.startDate || '',
        endDate: req.body['education[endDate]'] || employee.education?.endDate || '',
        certificate: processedDocuments.educationCertificate?.[0] || employee.education?.certificate || null
      };
    }
    
    // Process certificates
    const certificates = [];
    const certKeys = Object.keys(req.body).filter(key => key.startsWith('certificates['));
    const certIndices = [...new Set(certKeys.map(key => key.match(/certificates\[(\d+)\]/)[1]))];
    
    certIndices.forEach(index => {
      const cert = {
        name: req.body[`certificates[${index}][name]`] || '',
        institution: req.body[`certificates[${index}][institution]`] || '',
        issueDate: req.body[`certificates[${index}][issueDate]`] || '',
        expiryDate: req.body[`certificates[${index}][expiryDate]`] || '',
        file: processedDocuments.certificates?.[parseInt(index)] || null
      };
      if (cert.name || cert.institution) {
        certificates.push(cert);
      }
    });
    
    if (certificates.length > 0) {
      updateData.certificates = certificates;
    }
    
    // Update documents
    if (Object.keys(processedDocuments).some(key => processedDocuments[key].length > 0)) {
      updateData.documents = {
        ...employee.documents,
        ...processedDocuments
      };
    }
    
    // Update employee
    const updatedEmployee = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
    
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
});

module.exports = router; 