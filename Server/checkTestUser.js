const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./Modals/User');

const checkTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find test user
    const user = await User.findOne({ email: 'test@example.com' }).select('+password');
    if (!user) {
      console.log('Test user not found');
      return;
    }

    console.log('Test user found:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    console.log('Password hash:', user.password);

    // Test password
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isPasswordValid);

    // Test with correctPassword method
    const isCorrect = await user.correctPassword(testPassword, user.password);
    console.log('correctPassword method result:', isCorrect);

  } catch (error) {
    console.error('Error checking test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkTestUser(); 