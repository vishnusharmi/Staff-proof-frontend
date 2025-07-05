const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth');
const { asyncHandler, sendSuccessResponse, sendErrorResponse } = require('../Middlewares/errorHandler');

// @route   GET /api/addons
// @desc    Get available add-ons
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  // Mock add-ons data - in real app this would come from database
  const mockAddOns = [
    {
      id: 'edit-profile',
      name: 'Edit Profile',
      description: 'Unlock the ability to edit your personal information (name, phone, DOB, etc.) after initial submission.',
      price: 499,
      features: ['Edit personal details', 'Admin review for changes', 'One-time purchase'],
      billingCycle: null,
      category: 'profile'
    },
    {
      id: 'verification-badge',
      name: 'Verification Badge',
      description: 'Stand out with a verified green badge on your StaffProof profile, showcasing your thoroughly verified documents and job records.',
      price: 999,
      features: ['Green verified badge', 'Enhanced profile visibility', 'Trusted by employers', 'One-time purchase'],
      billingCycle: null,
      featured: true,
      category: 'verification'
    },
    {
      id: 'priority-verification',
      name: 'Priority Verification',
      description: 'Get your documents verified within 24 hours instead of the standard 3-5 business days.',
      price: 799,
      features: ['24-hour verification', 'Priority queue', 'One-time purchase'],
      billingCycle: null,
      category: 'verification'
    },
    {
      id: 'document-backup',
      name: 'Document Backup Service',
      description: 'Secure cloud backup of all your uploaded documents with automatic versioning.',
      price: 299,
      features: ['Cloud backup', 'Version control', 'Automatic sync', 'Monthly subscription'],
      billingCycle: 'monthly',
      category: 'storage'
    },
    {
      id: 'profile-analytics',
      name: 'Profile Analytics',
      description: 'Get detailed insights into who views your profile and how often.',
      price: 399,
      features: ['View analytics', 'Profile insights', 'Monthly reports', 'Monthly subscription'],
      billingCycle: 'monthly',
      category: 'analytics'
    }
  ];

  sendSuccessResponse(res, {
    data: mockAddOns
  });
}));

// @route   POST /api/addons/purchase
// @desc    Purchase an add-on
// @access  Private
router.post('/purchase', authenticateToken, asyncHandler(async (req, res) => {
  const { addOnId } = req.body;

  if (!addOnId) {
    return sendErrorResponse(res, 'Add-on ID is required', 400);
  }

  // Mock add-ons for validation
  const availableAddOns = [
    { id: 'edit-profile', price: 499 },
    { id: 'verification-badge', price: 999 },
    { id: 'priority-verification', price: 799 },
    { id: 'document-backup', price: 299 },
    { id: 'profile-analytics', price: 399 }
  ];

  const addOn = availableAddOns.find(a => a.id === addOnId);
  if (!addOn) {
    return sendErrorResponse(res, 'Add-on not found', 404);
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Mock purchase response
  const purchaseResponse = {
    success: true,
    addOnId,
    invoice: {
      id: Date.now(),
      invoiceNumber,
      amount: addOn.price,
      gst: addOn.price * 0.18, // 18% GST
      total: addOn.price * 1.18,
      status: 'Pending',
      description: `Purchase of ${addOnId} add-on`,
      date: new Date()
    },
    message: 'Add-on purchased successfully'
  };

  sendSuccessResponse(res, purchaseResponse);
}));

module.exports = router; 