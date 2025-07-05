const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

// Import database connection
const connectDB = require('./Config/dbConnection');

// Import middleware
const { errorHandler, notFound } = require('./Middlewares/errorHandler');

// Import routes
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const companyRoutes = require('./Routes/companyRoutes');
const verificationRoutes = require('./Routes/verificationRoutes');
const accessRequestRoutes = require('./Routes/accessRequestRoutes');
const blacklistRoutes = require('./Routes/blacklistRoutes');
const billingRoutes = require('./Routes/billingRoutes');
const auditRoutes = require('./Routes/auditRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const settingsRoutes = require('./Routes/settingsRoutes');
const addonRoutes = require('./Routes/addonRoutes');
const employerRoutes = require('./Routes/employerRoutes');
const caseAssignmentRoutes = require('./Routes/caseAssignmentRoutes');
const employeeRoutes = require('./Routes/employeeRoutes');
const verifierRoutes = require('./Routes/verifierRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/', authLimiter);

// Request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StaffProof API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', settingsRoutes);
app.use('/api/addons', addonRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/case-assignments', caseAssignmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/verifier', verifierRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'StaffProof API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile'
      },
      companies: {
        getAll: 'GET /api/companies',
        getById: 'GET /api/companies/:id',
        create: 'POST /api/companies',
        update: 'PUT /api/companies/:id',
        delete: 'DELETE /api/companies/:id'
      },
      verifications: {
        getAll: 'GET /api/verifications',
        getById: 'GET /api/verifications/:id',
        create: 'POST /api/verifications',
        update: 'PUT /api/verifications/:id',
        assign: 'POST /api/verifications/:id/assign',
        complete: 'POST /api/verifications/:id/complete'
      },
      accessRequests: {
        getAll: 'GET /api/access-requests',
        getById: 'GET /api/access-requests/:id',
        create: 'POST /api/access-requests',
        approve: 'POST /api/access-requests/:id/approve',
        deny: 'POST /api/access-requests/:id/deny'
      },
      blacklist: {
        getAll: 'GET /api/blacklist',
        getById: 'GET /api/blacklist/:id',
        create: 'POST /api/blacklist',
        update: 'PUT /api/blacklist/:id',
        remove: 'DELETE /api/blacklist/:id'
      },
      billing: {
        getAll: 'GET /api/billing',
        getById: 'GET /api/billing/:id',
        create: 'POST /api/billing',
        update: 'PUT /api/billing/:id',
        processPayment: 'POST /api/billing/:id/process-payment'
      },
      audit: {
        getAll: 'GET /api/audit',
        getById: 'GET /api/audit/:id',
        getUserLogs: 'GET /api/audit/user/:userId',
        getHighRisk: 'GET /api/audit/high-risk'
      },
      dashboard: {
        admin: 'GET /api/dashboard/admin',
        employer: 'GET /api/dashboard/employer',
        verifier: 'GET /api/dashboard/verifier',
        employee: 'GET /api/dashboard/employee'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)});