/**
 * Check User Tickets
 * Verifies UserTicket collection and API endpoint
 */

const mongoose = require('mongoose');
const UserTicket = require('../models/UserTicket');
const User = require('../models/User');

console.log('🎫 Checking User Tickets...');
console.log('==========================\n');

async function checkUserTickets() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Get all UserTickets
    console.log('\n🎫 All UserTickets in Database:');
    const allUserTickets = await UserTicket.find({});
    
    console.log(`Found ${allUserTickets.length} user tickets total`);
    
    if (allUserTickets.length > 0) {
      allUserTickets.forEach((userTicket, index) => {
        console.log(`\nUserTicket ${index + 1}:`);
        console.log(`   ID: ${userTicket._id}`);
        console.log(`   Order Number: ${userTicket.orderNumber}`);
        console.log(`   Status: ${userTicket.status}`);
        console.log(`   Event Name: ${userTicket.event.eventName}`);
        console.log(`   Event Type: ${userTicket.event.eventType}`);
        console.log(`   Customer: ${userTicket.customer.name} (${userTicket.customer.email})`);
        console.log(`   Total Amount: $${userTicket.totalAmount}`);
        console.log(`   Tickets Count: ${userTicket.tickets.length}`);
        console.log(`   Created At: ${userTicket.createdAt}`);
        
        if (userTicket.status === 'cancelled') {
          console.log(`   Cancelled At: ${userTicket.cancelledAt}`);
          console.log(`   Cancellation Reason: ${userTicket.cancellationReason}`);
        }
      });
    } else {
      console.log('❌ No user tickets found in database');
    }

    // Test findUserTickets function
    console.log('\n🔍 Testing findUserTickets function...');
    const testUser = await User.findOne({ role: 'attendee' });
    if (testUser) {
      console.log(`Testing with user: ${testUser.name} (${testUser.email})`);
      
      // Test by user ID
      const ticketsByUserId = await UserTicket.findUserTickets(testUser._id, null);
      console.log(`Tickets found by user ID: ${ticketsByUserId.length}`);
      
      // Test by email
      const ticketsByEmail = await UserTicket.findUserTickets(null, testUser.email);
      console.log(`Tickets found by email: ${ticketsByEmail.length}`);
      
      if (ticketsByEmail.length > 0) {
        console.log('\nTickets found by email:');
        ticketsByEmail.forEach((ticket, index) => {
          console.log(`   ${index + 1}. ${ticket.event.eventName} - ${ticket.status}`);
        });
      }
    } else {
      console.log('❌ No test user found');
    }

    // Check for cancelled user tickets
    console.log('\n🔍 Checking for cancelled user tickets...');
    const cancelledUserTickets = await UserTicket.find({ status: 'cancelled' });
    
    console.log(`Found ${cancelledUserTickets.length} cancelled user tickets`);
    
    if (cancelledUserTickets.length > 0) {
      console.log('\nCancelled user tickets:');
      cancelledUserTickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.event.eventName} - ${ticket.status}`);
        console.log(`      Order: ${ticket.orderNumber}`);
        console.log(`      Customer: ${ticket.customer.email}`);
        console.log(`      Cancelled At: ${ticket.cancelledAt}`);
        console.log(`      Reason: ${ticket.cancellationReason}`);
      });
    }

    console.log('\n🎯 User Tickets Investigation Results:');
    console.log('=====================================');
    console.log(`✅ Total user tickets: ${allUserTickets.length}`);
    console.log(`✅ Cancelled user tickets: ${cancelledUserTickets.length}`);
    console.log(`✅ Test user found: ${testUser ? 'Yes' : 'No'}`);

    console.log('\n💡 Next Steps:');
    console.log('==============');
    if (allUserTickets.length === 0) {
      console.log('❌ No user tickets found - need to create some');
      console.log('✅ Go to an event page and buy tickets to create user tickets');
    } else {
      console.log('✅ User tickets found - check the My Tickets page');
      console.log('✅ Look for tickets with status "cancelled" to see strikethrough styling');
    }

    console.log('\n✨ User tickets investigation completed! ✨');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUserTickets();
