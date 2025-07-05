const jwt = require('jsonwebtoken');
const User = require('../Modals/User');
const VerificationCase = require('../Modals/VerificationCase');
const Billing = require('../Modals/Billing');
const AuditLog = require('../Modals/AuditLog');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed recently. Please log in again.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user has required role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware to check if user can access company data
const authorizeCompanyAccess = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Admin can access all companies
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user belongs to the company
    if (req.user.company && req.user.company.toString() === companyId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own company data.'
    });
  } catch (error) {
    console.error('Company access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can access employee data
const authorizeEmployeeAccess = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId || req.body.employeeId || req.query.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Admin can access all employees
    if (req.user.role === 'Admin') {
      return next();
    }

    // Employee can only access their own data
    if (req.user.role === 'Employee' && req.user._id.toString() === employeeId) {
      return next();
    }

    // Employer and Verifier can access employees in their company
    if (['Employer', 'Verifier'].includes(req.user.role)) {
      const employee = await User.findById(employeeId);
      if (employee && employee.company && 
          employee.company.toString() === req.user.company.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot access this employee data.'
    });
  } catch (error) {
    console.error('Employee access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can access verification case data
const authorizeCaseAccess = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: 'Case ID is required'
      });
    }

    const verificationCase = await VerificationCase.findById(caseId);
    if (!verificationCase) {
      return res.status(404).json({
        success: false,
        message: 'Verification case not found'
      });
    }

    // Admin can access all cases
    if (req.user.role === 'Admin') {
      return next();
    }

    // Employee can only access their own cases
    if (req.user.role === 'Employee' && 
        verificationCase.employee.toString() === req.user._id.toString()) {
      return next();
    }

    // Employer can access cases from their company
    if (req.user.role === 'Employer' && 
        verificationCase.company.toString() === req.user.company.toString()) {
      return next();
    }

    // Verifier can access assigned cases and unassigned cases
    if (req.user.role === 'Verifier' && 
        (!verificationCase.assignedTo || 
         verificationCase.assignedTo.toString() === req.user._id.toString())) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot access this verification case.'
    });
  } catch (error) {
    console.error('Case access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can access billing data
const authorizeBillingAccess = async (req, res, next) => {
  try {
    const billingId = req.params.id;
    
    if (!billingId) {
      return res.status(400).json({
        success: false,
        message: 'Billing ID is required'
      });
    }

    const billingRecord = await Billing.findById(billingId);
    if (!billingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    // Admin can access all billing records
    if (req.user.role === 'Admin') {
      return next();
    }

    // User can access their own billing records
    if (billingRecord.user && 
        billingRecord.user.toString() === req.user._id.toString()) {
      return next();
    }

    // Employer can access company billing records
    if (req.user.role === 'Employer' && 
        billingRecord.company && 
        billingRecord.company.toString() === req.user.company.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot access this billing record.'
    });
  } catch (error) {
    console.error('Billing access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to log authentication attempts
const logAuthAttempt = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseData = JSON.parse(data);
    
    // Log authentication attempts
    if (req.path.includes('/login') || req.path.includes('/auth')) {
      const logData = {
        user: req.user ? req.user._id : null,
        action: req.path.includes('/login') ? 'login' : 'authentication',
        resource: {
          type: 'user',
          id: req.user ? req.user._id : null,
          name: req.user ? req.user.fullName : 'Unknown'
        },
        details: {
          description: `Authentication attempt for ${req.body.email || 'unknown email'}`,
          category: 'authentication',
          severity: responseData.success ? 'low' : 'medium',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.headers['x-request-id']
        },
        context: {
          company: req.user ? req.user.company : null,
          device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          browser: req.get('User-Agent')?.split(' ')[0] || 'unknown',
          os: req.get('User-Agent')?.split('(')[1]?.split(')')[0] || 'unknown'
        }
      };

      AuditLog.create(logData).catch(err => {
        console.error('Failed to create auth log:', err);
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware to check rate limiting for login attempts
const checkLoginAttempts = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next();
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    next();
  } catch (error) {
    console.error('Login attempts check error:', error);
    next();
  }
};

// Middleware to handle login attempt tracking
const trackLoginAttempt = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseData = JSON.parse(data);
    
    if (req.path.includes('/login')) {
      const { email } = req.body;
      
      User.findOne({ email }).then(user => {
        if (user) {
          if (responseData.success) {
            // Reset login attempts on successful login
            user.resetLoginAttempts();
          } else {
            // Increment login attempts on failed login
            user.incLoginAttempts();
          }
        }
      }).catch(err => {
        console.error('Failed to track login attempt:', err);
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeCompanyAccess,
  authorizeEmployeeAccess,
  authorizeCaseAccess,
  authorizeBillingAccess,
  logAuthAttempt,
  checkLoginAttempts,
  trackLoginAttempt
}; 