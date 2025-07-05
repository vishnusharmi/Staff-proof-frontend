const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['Admin', 'Employer', 'Employee', 'Verifier'],
    required: [true, 'Role is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Company Information (for Employer and Employee)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.role === 'Employer' || this.role === 'Employee';
    }
  },
  
  // Employee Specific Fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    required: function() {
      return this.role === 'Employee';
    }
  },
  designation: {
    type: String,
    required: function() {
      return this.role === 'Employee';
    }
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'Employee';
    }
  },
  joiningDate: {
    type: Date,
    required: function() {
      return this.role === 'Employee';
    }
  },
  endDate: {
    type: Date
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  staffProofId: {
    type: String,
    unique: true,
    sparse: true
  },
  badge: {
    type: String,
    enum: ['Basic', 'Premium', 'None'],
    default: 'Basic'
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Middle name cannot exceed 50 characters']
  },
  fatherName: {
    type: String,
    trim: true,
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  
  // Registration Form Fields
  pan: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
  },
  aadhaar: {
    type: String,
    trim: true,
    match: [/^\d{12}$/, 'Aadhaar number must be 12 digits']
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  education: {
    degree: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    grade: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    certificate: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  jobHistory: [{
    companyName: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    location: {
      type: String,
      trim: true
    }
  }],
  

  
  // File Uploads
  documents: {
    resume: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    certificates: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    governmentID: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    registration: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    gstCertificate: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    signatoryID: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    logo: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    aadharCard: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    panCard: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    offerLetter: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // KYC Status (for Employers)
  kycStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
    required: function() {
      return this.role === 'Employer';
    }
  },
  
  // Security and Access
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return;
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

module.exports = mongoose.model('User', userSchema); 