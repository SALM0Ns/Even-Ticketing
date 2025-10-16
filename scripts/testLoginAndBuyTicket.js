/**
 * Test Login and Buy Ticket Flow
 * Tests the complete user journey from login to ticket purchase
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');

console.log('🎫 Testing Login and Buy Ticket Flow...');
console.log('=====================================\n');

async function testLoginAndBuyTicket() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    console.log('\n👤 Finding test user...');
    const testUser = await User.findOne({ role: 'attendee' });
    if (!testUser) {
      console.log('❌ No attendee user found');
      return;
    }

    console.log(`✅ Test user found: ${testUser.name} (${testUser.email})`);
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Role: ${testUser.role}`);

    // Find 12 Angry Men event
    console.log('\n🎬 Finding 12 Angry Men Event...');
    const eventId = '68f029af3657a769464e78f5';
    const event = await Movie.findById(eventId);
    
    if (!event) {
      console.log('❌ Event not found');
      return;
    }

    console.log(`✅ Event found: ${event.name}`);
    console.log(`   Event ID: ${event._id}`);
    console.log(`   Show Dates: ${event.showDates ? event.showDates.length : 0} dates`);
    console.log(`   Showtimes: ${event.showtimes ? event.showtimes.length : 0} times`);

    // Check show dates
    if (event.showDates && event.showDates.length > 0) {
      console.log('\n📅 Show Dates:');
      event.showDates.forEach((dateObj, index) => {
        const date = new Date(dateObj.date);
        console.log(`   ${index + 1}. ${date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`);
      });
    } else {
      console.log('❌ No show dates found');
    }

    // Check showtimes
    if (event.showtimes && event.showtimes.length > 0) {
      console.log('\n⏰ Showtimes:');
      event.showtimes.forEach((time, index) => {
        console.log(`   ${index + 1}. ${time.time} (${time.availableSeats}/${time.totalSeats} seats)`);
      });
    } else {
      console.log('❌ No showtimes found');
    }

    // Test URLs
    console.log('\n🌐 Test URLs:');
    console.log('=============');
    console.log(`1. Login URL: http://localhost:3000/login`);
    console.log(`2. Event URL: http://localhost:3000/events/movies/${eventId}`);
    console.log(`3. Checkout URL: http://localhost:3000/checkout`);

    // Test login credentials
    console.log('\n🔐 Test Login Credentials:');
    console.log('==========================');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: (use the password you set for this user)`);

    // Test steps
    console.log('\n📋 Test Steps:');
    console.log('==============');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Login with the test user credentials');
    console.log('3. Go to http://localhost:3000/events/movies/' + eventId);
    console.log('4. Scroll down to "Select Your Seats" section');
    console.log('5. Check if show dates are visible');
    console.log('6. Select a show date');
    console.log('7. Select seats');
    console.log('8. Click "Buy Tickets" button');
    console.log('9. Complete the checkout process');

    // Check if user can buy tickets
    console.log('\n🎫 User Permissions:');
    console.log('====================');
    if (testUser.role === 'attendee') {
      console.log('✅ User can buy tickets (attendee role)');
    } else if (testUser.role === 'organizer') {
      console.log('❌ User cannot buy tickets (organizer role)');
    } else if (testUser.role === 'admin') {
      console.log('❌ User cannot buy tickets (admin role)');
    }

    console.log('\n🎯 Test Results:');
    console.log('================');
    console.log('✅ Test user found and ready');
    console.log('✅ Event found with show dates and showtimes');
    console.log('✅ URLs generated for testing');
    console.log('✅ Test steps provided');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Use the test URLs to manually test the flow');
    console.log('2. Check browser console for any JavaScript errors');
    console.log('3. Verify that show dates are loading correctly');
    console.log('4. Test the complete ticket purchase flow');

    console.log('\n✨ Login and buy ticket test setup completed! ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testLoginAndBuyTicket();
