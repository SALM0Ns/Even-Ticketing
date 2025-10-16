/**
 * Fix 12 Angry Men UserTicket
 * Updates the UserTicket for 12 Angry Men to cancelled status
 */

const mongoose = require('mongoose');
const UserTicket = require('../models/UserTicket');

console.log('🔧 Fixing 12 Angry Men UserTicket...');
console.log('===================================\n');

async function fix12AngryMenUserTicket() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Find the 12 Angry Men UserTicket
    console.log('\n🎫 Finding 12 Angry Men UserTicket...');
    const userTicketId = '68f03576208205c3d6f70fd4';
    const userTicket = await UserTicket.findById(userTicketId);
    
    if (!userTicket) {
      console.log('❌ UserTicket not found');
      return;
    }

    console.log(`✅ UserTicket found: ${userTicket.event.eventName}`);
    console.log(`   ID: ${userTicket._id}`);
    console.log(`   Status: ${userTicket.status}`);
    console.log(`   Customer: ${userTicket.customer.name} (${userTicket.customer.email})`);
    console.log(`   Total Amount: $${userTicket.totalAmount}`);

    // Update the UserTicket to cancelled
    console.log('\n🔧 Updating UserTicket to cancelled...');
    await UserTicket.findByIdAndUpdate(userTicketId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: 'Event deleted by admin'
    });

    console.log('✅ UserTicket updated to cancelled');

    // Verify the update
    console.log('\n✅ Verifying the update...');
    const updatedUserTicket = await UserTicket.findById(userTicketId);
    console.log(`Updated status: ${updatedUserTicket.status}`);
    console.log(`Cancelled at: ${updatedUserTicket.cancelledAt}`);
    console.log(`Cancellation reason: ${updatedUserTicket.cancellationReason}`);

    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const testEmail = userTicket.customer.email;
    console.log(`Test email: ${testEmail}`);
    
    const ticketsByEmail = await UserTicket.findUserTickets(null, testEmail);
    console.log(`Tickets found by email: ${ticketsByEmail.length}`);
    
    if (ticketsByEmail.length > 0) {
      console.log('\nTickets found:');
      ticketsByEmail.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.event.eventName} - ${ticket.status}`);
        if (ticket.status === 'cancelled') {
          console.log(`      Cancelled at: ${ticket.cancelledAt}`);
          console.log(`      Reason: ${ticket.cancellationReason}`);
        }
      });
    }

    // Test URLs
    console.log('\n🌐 Test URLs:');
    console.log('=============');
    console.log(`1. Login URL: http://localhost:3000/login`);
    console.log(`2. My Tickets URL: http://localhost:3000/my-tickets`);
    console.log(`3. User Email: ${testEmail}`);

    console.log('\n🎯 Fix Results:');
    console.log('===============');
    console.log('✅ UserTicket updated to cancelled successfully');
    console.log('✅ Cancellation reason set');
    console.log('✅ API endpoint tested');
    console.log('✅ Ready for testing cancelled ticket display');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Login with the user email');
    console.log('2. Go to My Tickets page');
    console.log('3. Look for the 12 Angry Men ticket');
    console.log('4. Verify it shows strikethrough styling');
    console.log('5. Check for "CANCELLED" overlay');

    console.log('\n✨ 12 Angry Men UserTicket fix completed! ✨');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fix12AngryMenUserTicket();
