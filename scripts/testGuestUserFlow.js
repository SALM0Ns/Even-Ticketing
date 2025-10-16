/**
 * Test Guest User Flow
 * Tests the complete flow for guest users trying to purchase tickets
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');

console.log('🧪 Testing Guest User Flow...');
console.log('============================\n');

async function testGuestUserFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // 1. Find a test event
    console.log('\n🎬 Finding test event...');
    const testEvent = await Movie.findOne();
    if (!testEvent) {
      console.error('❌ No events found in database');
      return;
    }
    console.log(`✅ Test event found: ${testEvent.name}`);
    console.log(`   Event ID: ${testEvent._id}`);
    console.log(`   Event URL: http://localhost:3000/events/movies/${testEvent._id}`);

    // 2. Find or create a test attendee user
    console.log('\n👤 Finding test attendee user...');
    let testUser = await User.findOne({ role: 'attendee' });
    if (!testUser) {
      console.log('Creating test attendee user...');
      testUser = new User({
        name: 'Test Attendee',
        email: 'attendee@test.com',
        password: 'password123',
        role: 'attendee',
        profile: {
          phone: '123-456-7890',
          dateOfBirth: new Date('1990-01-01')
        }
      });
      await testUser.save();
      console.log('✅ Test attendee user created');
    } else {
      console.log('✅ Test attendee user found');
    }
    console.log(`   User: ${testUser.name} (${testUser.email})`);
    console.log(`   Role: ${testUser.role}`);

    // 3. Test URLs and scenarios
    console.log('\n🌐 Test URLs and Scenarios:');
    console.log('===========================');
    console.log('1. Event Page (Guest Access):');
    console.log(`   URL: http://localhost:3000/events/movies/${testEvent._id}`);
    console.log('   Expected: Guest can view event details and select seats');
    console.log('   Expected: "Proceed to Checkout" button should redirect to login');

    console.log('\n2. Login Page:');
    console.log('   URL: http://localhost:3000/auth/login');
    console.log('   Expected: Login form with pending checkout notification');

    console.log('\n3. Register Page:');
    console.log('   URL: http://localhost:3000/auth/register');
    console.log('   Expected: Only attendee registration allowed');

    console.log('\n4. Checkout Page (Guest Access):');
    console.log('   URL: http://localhost:3000/checkout');
    console.log('   Expected: Redirect to login page');

    console.log('\n5. Checkout Page (Attendee Access):');
    console.log('   URL: http://localhost:3000/checkout');
    console.log('   Expected: Checkout form accessible');

    console.log('\n6. Checkout Page (Organizer/Admin Access):');
    console.log('   URL: http://localhost:3000/checkout');
    console.log('   Expected: Redirect to respective dashboard');

    console.log('\n🎯 Test Scenarios:');
    console.log('==================');
    console.log('Scenario 1: Guest User Flow');
    console.log('1. Go to event page as guest');
    console.log('2. Select seats and show date');
    console.log('3. Click "Proceed to Checkout"');
    console.log('4. Should see alert and redirect to login');
    console.log('5. Login page should show pending checkout notification');
    console.log('6. After login, should redirect back to event page');
    console.log('7. Can now proceed to checkout');

    console.log('\nScenario 2: Registration Flow');
    console.log('1. Go to register page');
    console.log('2. Should only see attendee option');
    console.log('3. Fill form and submit');
    console.log('4. Should create user with role "attendee"');
    console.log('5. Should redirect to home page');

    console.log('\nScenario 3: Role Restrictions');
    console.log('1. Login as organizer/admin');
    console.log('2. Try to access /checkout');
    console.log('3. Should redirect to respective dashboard');
    console.log('4. Should see error message about not being able to purchase');

    console.log('\n✅ Test Data Ready:');
    console.log('===================');
    console.log(`Event: ${testEvent.name}`);
    console.log(`Event URL: http://localhost:3000/events/movies/${testEvent._id}`);
    console.log(`Test User: ${testUser.email}`);
    console.log(`Test Password: password123`);

    console.log('\n💡 Manual Testing Steps:');
    console.log('========================');
    console.log('1. Open browser in incognito/private mode');
    console.log('2. Go to event page and test guest flow');
    console.log('3. Test registration with new email');
    console.log('4. Test login with existing user');
    console.log('5. Test checkout restrictions for different roles');

    console.log('\n✨ Guest user flow test setup completed! ✨');

  } catch (error) {
    console.error('❌ Test setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testGuestUserFlow();
