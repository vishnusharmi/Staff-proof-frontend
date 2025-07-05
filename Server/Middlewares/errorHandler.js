const AuditLog = require('../Modals/AuditLog');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // AWS S3 errors
  if (err.code === 'NoSuchBucket') {
    const message = 'Storage bucket not found';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'AccessDenied') {
    const message = 'Access denied to storage';
    error = { message, statusCode: 403 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Create audit log for errors
  createErrorAuditLog(req, err, error.statusCode || 500);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Create audit log for errors
const createErrorAuditLog = async (req, err, statusCode) => {
  try {
    const logData = {
      user: req.user ? req.user._id : null,
      action: 'error',
      resource: {
        type: 'system',
        id: null,
        name: 'Error Handler'
      },
      details: {
        description: `Error occurred: ${err.message}`,
        category: 'system_operation',
        severity: statusCode >= 500 ? 'high' : 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id']
      },
      context: {
        company: req.user ? req.user.company : null,
        device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        browser: req.get('User-Agent')?.split(' ')[0] || 'unknown',
        os: req.get('User-Agent')?.split('(')[1]?.split(')')[0] || 'unknown'
      },
      changes: {
        before: null,
        after: null,
        fields: ['error']
      }
    };

    await AuditLog.create(logData);
  } catch (auditError) {
    console.error('Failed to create error audit log:', auditError);
  }
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error handler
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  next(err);
};

// Database connection error handler
const dbErrorHandler = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    console.error('Database error:', err);
    
    return res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable'
    });
  }
  next(err);
};

// File upload error handler
const fileUploadErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB`
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({
      success: false,
      message: `Invalid file type. Allowed types: ${process.env.ALLOWED_FILE_TYPES}`
    });
  }

  next(err);
};

// Rate limiting error handler
const rateLimitErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(err.msBeforeNext / 1000)
    });
  }
  next(err);
};

// Security error handler
const securityErrorHandler = (err, req, res, next) => {
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable'
    });
  }

  if (err.code === 'UNAUTHORIZED') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  next(err);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response helper
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Success response helper
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validationErrorHandler,
  dbErrorHandler,
  fileUploadErrorHandler,
  rateLimitErrorHandler,
  securityErrorHandler,
  AppError,
  sendErrorResponse,
  sendSuccessResponse
}; 