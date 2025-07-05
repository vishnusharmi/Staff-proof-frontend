const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./Modals/User');
const Company = require('./Modals/Company');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test company exists, create if not
    let testCompany = await Company.findOne({ name: 'Test Company' });
    if (!testCompany) {
      testCompany = new Company({
        name: 'Test Company',
        website: 'https://testcompany.com',
        pan: 'ABCDE1234F',
        gst: '22AAAAA0000A1Z5',
        cin: 'L12345MH2000PLC123456',
        authorizedPersonName: 'John Doe',
        authorizedPersonEmail: 'contact@testcompany.com',
        authorizedPersonContact: '+1234567890',
        status: 'active',
        isVerified: true
      });
      await testCompany.save();
      console.log('Test company created successfully');
    }

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'Employee',
      status: 'active',
      company: testCompany._id,
      employeeId: 'TEST001',
      designation: 'Software Developer',
      department: 'IT',
      joiningDate: new Date(),
      isVerified: true
    });

    await testUser.save();
    console.log('Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser(); 