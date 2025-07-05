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

// Generate StaffProof ID
const generateStaffProofId = () => {
  const prefix = 'SP-';
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

module.exports = router; 