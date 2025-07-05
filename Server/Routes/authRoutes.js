const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Import models
const User = require('../Modals/User');
const Company = require('../Modals/Company');
const AuditLog = require('../Modals/AuditLog');

// Import middleware
const { 
  authenticateToken, 
  authorizeRole, 
  logAuthAttempt, 
  checkLoginAttempts, 
  trackLoginAttempt 
} = require('../Middlewares/auth');
const { 
  validateUserLogin, 
  validateUserRegistration, 
  validatePasswordChange 
} = require('../Middlewares/validation');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// Import services
const { SESService, emailTemplates } = require('../Services/awsService');
const NotificationService = require('../Services/notificationService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role, companyId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendErrorResponse(res, 400, 'User with this email already exists');
  }

  // If role is Employee or Employer, company is required
  if ((role === 'Employee' || role === 'Employer') && !companyId) {
    return sendErrorResponse(res, 400, 'Company ID is required for Employee and Employer roles');
  }

  // Verify company exists if provided
  if (companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      return sendErrorResponse(res, 400, 'Company not found');
    }
  }

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    status: 'pending'
  };

  if (companyId) {
    userData.company = companyId;
  }

  const user = await User.create(userData);

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create audit log
  await AuditLog.create({
    user: user._id,
    action: 'user_create',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `New user registered: ${user.firstName} ${user.lastName} (${user.role})`,
      category: 'authentication',
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Send welcome notification
  try {
    await NotificationService.createNotification({
      recipient: user._id,
      title: 'Welcome to StaffProof!',
      message: `Welcome ${user.firstName}! Your account has been created successfully.`,
      type: 'success',
      category: 'profile',
      priority: 'medium',
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    });
  } catch (notificationError) {
    console.error('Failed to send welcome notification:', notificationError);
  }

  // Send welcome email
  try {
    const emailData = {
      firstName: user.firstName,
      email: user.email,
      role: user.role
    };
    
    await SESService.sendEmail(
      user.email,
      emailTemplates.welcome.subject,
      emailTemplates.welcome.html(emailData)
    );
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  // Remove password from response
  user.password = undefined;

  sendSuccessResponse(res, {
    user,
    token,
    refreshToken
  }, 'User registered successfully', 201);
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, checkLoginAttempts, logAuthAttempt, trackLoginAttempt, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendErrorResponse(res, 401, 'Invalid credentials');
  }

  // Check if user is active
  if (user.status !== 'active') {
    return sendErrorResponse(res, 401, `Account is ${user.status}. Please contact support.`);
  }

  // Check password
  const isPasswordValid = await user.correctPassword(password, user.password);
  if (!isPasswordValid) {
    return sendErrorResponse(res, 401, 'Invalid credentials');
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create audit log
  await AuditLog.create({
    user: user._id,
    action: 'login',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `User logged in: ${user.firstName} ${user.lastName}`,
      category: 'authentication',
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Send security alert for new login
  try {
    await NotificationService.sendSecurityAlert(user._id, 'login', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      loginTime: new Date(),
      location: 'Unknown' // You can add IP geolocation here
    });
  } catch (notificationError) {
    console.error('Failed to send login notification:', notificationError);
  }

  // Remove password from response
  user.password = undefined;

  sendSuccessResponse(res, {
    user,
    token,
    refreshToken
  }, 'Login successful');
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendErrorResponse(res, 400, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return sendErrorResponse(res, 401, 'Invalid refresh token');
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendErrorResponse(res, 401, 'User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return sendErrorResponse(res, 401, 'User account is not active');
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    sendSuccessResponse(res, {
      token: newToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    return sendErrorResponse(res, 401, 'Invalid refresh token');
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'logout',
    resource: {
      type: 'user',
      id: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`
    },
    details: {
      description: `User logged out: ${req.user.firstName} ${req.user.lastName}`,
      category: 'authentication',
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  sendSuccessResponse(res, null, 'Logout successful');
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return sendSuccessResponse(res, null, 'If an account with that email exists, a password reset link has been sent');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  // Save reset token to user
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(resetTokenExpiry);
  await user.save();

  // Create reset link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Send reset email
  try {
    const emailData = {
      firstName: user.firstName,
      resetLink
    };

    await SESService.sendEmail(
      user.email,
      emailTemplates.passwordReset.subject,
      emailTemplates.passwordReset.html(emailData)
    );
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    return sendErrorResponse(res, 500, 'Failed to send password reset email');
  }

  // Create audit log
  await AuditLog.create({
    user: user._id,
    action: 'password_reset',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `Password reset requested for: ${user.firstName} ${user.lastName}`,
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  sendSuccessResponse(res, null, 'If an account with that email exists, a password reset link has been sent');
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return sendErrorResponse(res, 400, 'Token and new password are required');
  }

  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return sendErrorResponse(res, 400, 'Invalid or expired reset token');
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  // Create audit log
  await AuditLog.create({
    user: user._id,
    action: 'password_change',
    resource: {
      type: 'user',
      id: user._id,
      name: `${user.firstName} ${user.lastName}`
    },
    details: {
      description: `Password reset completed for: ${user.firstName} ${user.lastName}`,
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  sendSuccessResponse(res, null, 'Password reset successful');
}));

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated user)
// @access  Private
router.post('/change-password', authenticateToken, validatePasswordChange, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Verify current password
  const isCurrentPasswordValid = await req.user.correctPassword(currentPassword, req.user.password);
  if (!isCurrentPasswordValid) {
    return sendErrorResponse(res, 400, 'Current password is incorrect');
  }

  // Update password
  req.user.password = newPassword;
  req.user.passwordChangedAt = Date.now();
  await req.user.save();

  // Create audit log
  await AuditLog.create({
    user: req.user._id,
    action: 'password_change',
    resource: {
      type: 'user',
      id: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`
    },
    details: {
      description: `Password changed for: ${req.user.firstName} ${req.user.lastName}`,
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  sendSuccessResponse(res, null, 'Password changed successfully');
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
            .populate('company', 'name')
    .select('-password');

  sendSuccessResponse(res, { user }, 'User profile retrieved successfully');
}));

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    await SESService.verifyEmail(email);
    sendSuccessResponse(res, null, 'Verification email sent successfully');
  } catch (error) {
    return sendErrorResponse(res, 500, 'Failed to send verification email');
  }
}));

module.exports = router; 