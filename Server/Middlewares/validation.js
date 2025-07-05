const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .isIn(['Admin', 'Employer', 'Employee', 'Verifier'])
    .withMessage('Invalid role specified'),
  
  handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for company creation
const validateCompanyCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('legalName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Legal name must be between 2 and 100 characters'),
  
  body('registrationNumber')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Registration number must be between 5 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('address.country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('address.zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('ZIP code must be between 3 and 20 characters'),
  
  body('industry')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Industry must be between 2 and 100 characters'),
  
  body('companySize')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  
  body('businessType')
    .isIn(['private', 'public', 'government', 'non_profit', 'startup'])
    .withMessage('Invalid business type'),
  
  handleValidationErrors
];

// Validation rules for employee creation
const validateEmployeeCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('designation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  
  body('joiningDate')
    .isISO8601()
    .withMessage('Please provide a valid joining date'),
  
  body('company')
    .isMongoId()
    .withMessage('Please provide a valid company ID'),
  
  handleValidationErrors
];

// Validation rules for verification case creation
const validateVerificationCaseCreation = [
  body('employee')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  
  body('company')
    .isMongoId()
    .withMessage('Please provide a valid company ID'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid verifier ID'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  handleValidationErrors
];

// Validation rules for access request creation
const validateAccessRequestCreation = [
  body('targetEmployee')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  
  body('requestType')
    .isIn(['background_check', 'employment_verification', 'reference_check', 'general_inquiry'])
    .withMessage('Invalid request type'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid urgency level'),
  
  body('accessDuration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Access duration must be between 1 and 365 days'),
  
  handleValidationErrors
];

// Validation rules for blacklist creation
const validateBlacklistCreation = [
  body('entityType')
    .isIn(['employee', 'company'])
    .withMessage('Invalid entity type'),
  
  body('entity')
    .isMongoId()
    .withMessage('Please provide a valid entity ID'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  
  body('category')
    .isIn(['fraud', 'misconduct', 'performance', 'policy_violation', 'legal_issues', 'security_breach', 'harassment', 'other'])
    .withMessage('Invalid category'),
  
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),
  
  body('scope')
    .optional()
    .isIn(['company_specific', 'industry_wide', 'platform_wide'])
    .withMessage('Invalid scope'),
  
  handleValidationErrors
];

// Validation rules for company update
const validateCompanyUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Industry must be between 2 and 100 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

// Validation rules for verification case creation
const validateCaseCreation = [
  body('employeeId')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  
  body('companyId')
    .isMongoId()
    .withMessage('Please provide a valid company ID'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('verificationType')
    .isIn(['background_check', 'employment_verification', 'education_verification', 'reference_check', 'identity_verification', 'comprehensive'])
    .withMessage('Invalid verification type'),
  
  body('requiredDocuments')
    .optional()
    .isArray()
    .withMessage('Required documents must be an array'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  
  handleValidationErrors
];

// Validation rules for verification case update
const validateCaseUpdate = [
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('verificationType')
    .optional()
    .isIn(['background_check', 'employment_verification', 'education_verification', 'reference_check', 'identity_verification', 'comprehensive'])
    .withMessage('Invalid verification type'),
  
  body('requiredDocuments')
    .optional()
    .isArray()
    .withMessage('Required documents must be an array'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'under_review', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid verifier ID'),
  
  handleValidationErrors
];

// Validation rules for document upload
const validateDocumentUpload = [
  body('documentType')
    .isIn(['resume', 'government_id', 'payslips', 'experience_letters', 'educational_certificates', 'reference_letters', 'other'])
    .withMessage('Invalid document type'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  handleValidationErrors
];

// Validation rules for blacklist entry
const validateBlacklistEntry = [
  body('entityId')
    .isMongoId()
    .withMessage('Please provide a valid entity ID'),
  
  body('entityType')
    .isIn(['user', 'company'])
    .withMessage('Invalid entity type'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  handleValidationErrors
];

// Validation rules for billing creation
const validateBillingCreation = [
  body('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  
  body('companyId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid company ID'),
  
  body('type')
    .optional()
    .isIn(['subscription', 'one_time', 'verification', 'other'])
    .withMessage('Invalid billing type'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  
  body('subscriptionPlan')
    .optional()
    .isIn(['basic', 'pro', 'enterprise'])
    .withMessage('Invalid subscription plan'),
  
  handleValidationErrors
];

// Validation rules for payment processing
const validatePayment = [
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'])
    .withMessage('Invalid payment method'),
  
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  
  body('paymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a positive number'),
  
  body('paymentNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Payment notes must not exceed 500 characters'),
  
  handleValidationErrors
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  handleValidationErrors
];

// Validation rules for search
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  
  query('filters')
    .optional()
    .isJSON()
    .withMessage('Filters must be valid JSON'),
  
  handleValidationErrors
];

// Validation rules for ID parameters
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  
  handleValidationErrors
];

// Validation rules for file upload
const validateFileUpload = [
  body('type')
    .isIn(['resume', 'governmentId', 'payslips', 'experienceLetters', 'educationalCertificates', 'other'])
    .withMessage('Invalid file type'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  handleValidationErrors
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCompanyCreation,
  validateCompanyUpdate,
  validateEmployeeCreation,
  validateCaseCreation,
  validateCaseUpdate,
  validateDocumentUpload,
  validateAccessRequestCreation,
  validateBlacklistEntry,
  validateBillingCreation,
  validatePayment,
  validatePagination,
  validateSearch,
  validateIdParam,
  validateFileUpload,
  validatePasswordChange,
  validateProfileUpdate
}; 