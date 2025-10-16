/**
 * Check Cancelled Tickets for 12 Angry Men
 * Verifies if tickets are properly marked as cancelled after event deletion
 */

const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Movie = require('../models/Movie');

console.log('🎫 Checking Cancelled Tickets for 12 Angry Men...');
console.log('===============================================\n');

async function checkCancelledTickets() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Check if 12 Angry Men event still exists
    console.log('\n🎬 Checking if 12 Angry Men event exists...');
    const eventId = '68f029af3657a769464e78f5';
    const event = await Movie.findById(eventId);
    
    if (event) {
      console.log(`✅ Event still exists: ${event.name}`);
      console.log(`   Event ID: ${event._id}`);
      console.log(`   Status: ${event.status}`);
    } else {
      console.log('❌ Event not found - it has been deleted');
    }

    // Check tickets for 12 Angry Men
    console.log('\n🎫 Checking tickets for 12 Angry Men...');
    const tickets = await Ticket.find({ 
      'ticketDetails.eventName': { $regex: /12 Angry Men/i }
    });
    
    console.log(`Found ${tickets.length} tickets for 12 Angry Men`);
    
    if (tickets.length > 0) {
      tickets.forEach((ticket, index) => {
        console.log(`\nTicket ${index + 1}:`);
        console.log(`   Ticket ID: ${ticket._id}`);
        console.log(`   Ticket Number: ${ticket.ticketNumber}`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   Event Name: ${ticket.ticketDetails.eventName}`);
        console.log(`   User: ${ticket.user}`);
        console.log(`   Purchase Date: ${ticket.purchaseDate}`);
        console.log(`   Cancelled At: ${ticket.cancelledAt || 'Not cancelled'}`);
        console.log(`   Cancellation Reason: ${ticket.cancellationReason || 'No reason provided'}`);
        
        if (ticket.status === 'cancelled') {
          console.log('   ✅ Ticket is properly marked as cancelled');
        } else {
          console.log('   ❌ Ticket is NOT marked as cancelled');
        }
      });
    } else {
      console.log('❌ No tickets found for 12 Angry Men');
    }

    // Check orders for 12 Angry Men
    console.log('\n📋 Checking orders for 12 Angry Men...');
    const orders = await Order.find({ 
      'eventName': { $regex: /12 Angry Men/i }
    });
    
    console.log(`Found ${orders.length} orders for 12 Angry Men`);
    
    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Event Name: ${order.eventName}`);
        console.log(`   Customer: ${order.customerInfo.name} (${order.customerInfo.email})`);
        console.log(`   Total Amount: $${order.totalAmount}`);
        console.log(`   Created At: ${order.createdAt}`);
        console.log(`   Updated At: ${order.updatedAt}`);
        
        if (order.status === 'cancelled') {
          console.log('   ✅ Order is properly marked as cancelled');
        } else {
          console.log('   ❌ Order is NOT marked as cancelled');
        }
      });
    } else {
      console.log('❌ No orders found for 12 Angry Men');
    }

    // Check all cancelled tickets
    console.log('\n🔍 Checking all cancelled tickets...');
    const allCancelledTickets = await Ticket.find({ status: 'cancelled' });
    
    console.log(`Found ${allCancelledTickets.length} cancelled tickets total`);
    
    if (allCancelledTickets.length > 0) {
      console.log('\nAll cancelled tickets:');
      allCancelledTickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.ticketDetails.eventName} - ${ticket.ticketNumber} (${ticket.status})`);
      });
    }

    // Check all cancelled orders
    console.log('\n🔍 Checking all cancelled orders...');
    const allCancelledOrders = await Order.find({ status: 'cancelled' });
    
    console.log(`Found ${allCancelledOrders.length} cancelled orders total`);
    
    if (allCancelledOrders.length > 0) {
      console.log('\nAll cancelled orders:');
      allCancelledOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.eventName} - ${order.orderNumber} (${order.status})`);
      });
    }

    console.log('\n🎯 Cancelled Tickets Investigation Results:');
    console.log('==========================================');
    console.log(`✅ Event exists: ${event ? 'Yes' : 'No'}`);
    console.log(`✅ Tickets found: ${tickets.length}`);
    console.log(`✅ Orders found: ${orders.length}`);
    console.log(`✅ Cancelled tickets total: ${allCancelledTickets.length}`);
    console.log(`✅ Cancelled orders total: ${allCancelledOrders.length}`);

    console.log('\n💡 Next Steps:');
    console.log('==============');
    if (tickets.length > 0) {
      const cancelledTickets = tickets.filter(t => t.status === 'cancelled');
      if (cancelledTickets.length === tickets.length) {
        console.log('✅ All tickets are properly marked as cancelled');
        console.log('✅ Check the My Tickets page to see strikethrough styling');
      } else {
        console.log('❌ Some tickets are not marked as cancelled');
        console.log('❌ Need to update ticket status to cancelled');
      }
    } else {
      console.log('❌ No tickets found - may need to check different search criteria');
    }

    console.log('\n✨ Cancelled tickets investigation completed! ✨');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCancelledTickets();
