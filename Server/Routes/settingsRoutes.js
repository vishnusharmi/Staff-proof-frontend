const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/users/devices
// @desc    Get user connected devices
// @access  Private
router.get('/devices', authenticateToken, asyncHandler(async (req, res) => {
  // Mock devices data - in real app this would come from database
  const mockDevices = [
    {
      id: 1,
      userId: req.user.id,
      name: 'Windows Desktop',
      os: 'Windows 10',
      browser: 'Chrome 115',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      location: 'Kolkata, India',
      ipAddress: '192.168.1.100',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      id: 2,
      userId: req.user.id,
      name: 'Android Phone',
      os: 'Android 13',
      browser: 'Firefox Mobile',
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      location: 'Mumbai, India',
      ipAddress: '192.168.1.101',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    }
  ];

  sendSuccessResponse(res, {
    data: mockDevices
  });
}));

// @route   DELETE /api/users/devices/:id
// @desc    Revoke device access
// @access  Private
router.delete('/devices/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // In real app, revoke the device access in database
  // For now, just return success
  sendSuccessResponse(res, {
    message: 'Device access revoked successfully',
    id: parseInt(id)
  });
}));

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendErrorResponse(res, 'Current password and new password are required', 400);
  }

  // In real app, verify current password and update with new password
  // For now, just return success
  sendSuccessResponse(res, {
    message: 'Password changed successfully'
  });
}));

// @route   PUT /api/users/change-email
// @desc    Change user email
// @access  Private
router.put('/change-email', authenticateToken, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendErrorResponse(res, 'Email is required', 400);
  }

  // In real app, update email in database
  // For now, just return success
  sendSuccessResponse(res, {
    message: 'Email changed successfully',
    email
  });
}));

// @route   POST /api/users/2fa/enable
// @desc    Enable two-factor authentication
// @access  Private
router.post('/2fa/enable', authenticateToken, asyncHandler(async (req, res) => {
  // In real app, generate 2FA secret and QR code
  // For now, just return success
  sendSuccessResponse(res, {
    message: 'Two-factor authentication enabled successfully'
  });
}));

// @route   POST /api/users/2fa/disable
// @desc    Disable two-factor authentication
// @access  Private
router.post('/2fa/disable', authenticateToken, asyncHandler(async (req, res) => {
  // In real app, disable 2FA in database
  // For now, just return success
  sendSuccessResponse(res, {
    message: 'Two-factor authentication disabled successfully'
  });
}));

module.exports = router; 