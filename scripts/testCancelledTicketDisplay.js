/**
 * Test Cancelled Ticket Display
 * Creates a test ticket for 12 Angry Men and marks it as cancelled
 */

const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

console.log('🎫 Testing Cancelled Ticket Display...');
console.log('====================================\n');

async function testCancelledTicketDisplay() {
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

    // Create a test ticket for 12 Angry Men
    console.log('\n🎫 Creating test ticket for 12 Angry Men...');
    const testTicket = new Ticket({
      event: '68f029af3657a769464e78f5', // 12 Angry Men event ID (even though event is deleted)
      user: testUser._id,
      eventType: 'Movie',
      price: 25.00,
      pricingType: 'regular',
      seatInfo: {
        seatNumber: 'A-12',
        section: 'General',
        row: 'A',
        seat: '12'
      },
      ticketDetails: {
        category: 'movies',
        eventName: '12 Angry Men',
        eventDate: new Date('2025-10-17T19:00:00.000Z'),
        venue: 'AMC Lincoln Square',
        organizer: 'Test Organizer'
      },
      ticketNumber: 'T' + Date.now().toString().slice(-6),
      qrCode: 'QR-' + Date.now().toString().slice(-6),
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: 'Event deleted by admin'
    });

    await testTicket.save();
    console.log('✅ Test ticket created successfully');
    console.log(`   Ticket ID: ${testTicket._id}`);
    console.log(`   Ticket Number: ${testTicket.ticketNumber}`);
    console.log(`   Status: ${testTicket.status}`);
    console.log(`   Event Name: ${testTicket.ticketDetails.eventName}`);

    // Verify the ticket was created
    console.log('\n✅ Verifying test ticket...');
    const savedTicket = await Ticket.findById(testTicket._id);
    if (savedTicket) {
      console.log('✅ Ticket saved successfully');
      console.log(`   Status: ${savedTicket.status}`);
      console.log(`   Cancelled At: ${savedTicket.cancelledAt}`);
      console.log(`   Cancellation Reason: ${savedTicket.cancellationReason}`);
    } else {
      console.log('❌ Ticket not found after saving');
    }

    // Test URLs
    console.log('\n🌐 Test URLs:');
    console.log('=============');
    console.log(`1. Login URL: http://localhost:3000/login`);
    console.log(`2. My Tickets URL: http://localhost:3000/my-tickets`);
    console.log(`3. User Email: ${testUser.email}`);

    console.log('\n🎯 Test Results:');
    console.log('===============');
    console.log('✅ Test ticket created for 12 Angry Men');
    console.log('✅ Ticket marked as cancelled');
    console.log('✅ Cancellation reason set');
    console.log('✅ Ready for testing cancelled ticket display');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Login with the test user email');
    console.log('2. Go to My Tickets page');
    console.log('3. Look for the 12 Angry Men ticket');
    console.log('4. Verify it shows strikethrough styling');
    console.log('5. Check for "CANCELLED" overlay');

    console.log('\n✨ Test cancelled ticket display setup completed! ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCancelledTicketDisplay();
