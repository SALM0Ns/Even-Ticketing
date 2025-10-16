const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@cursedticket.com' });
    
    if (existingUser) {
      console.log('👤 Test user already exists:');
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Created: ${existingUser.createdAt}`);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'testuser@cursedticket.com',
      password: 'password123',
      role: 'attendee',
      profile: {
        phone: '123-456-7890',
        preferences: {
          categories: ['movies', 'stage-plays'],
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully:');
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   ID: ${testUser._id}`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Email: testuser@cursedticket.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser();
