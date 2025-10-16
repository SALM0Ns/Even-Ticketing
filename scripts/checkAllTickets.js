/**
 * Check All Tickets
 * Lists all tickets in the database to find user's tickets
 */

const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const User = require('../models/User');

console.log('🎫 Checking All Tickets...');
console.log('=========================\n');

async function checkAllTickets() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Get all tickets
    console.log('\n🎫 All Tickets in Database:');
    const allTickets = await Ticket.find({});
    
    console.log(`Found ${allTickets.length} tickets total`);
    
    if (allTickets.length > 0) {
      allTickets.forEach((ticket, index) => {
        console.log(`\nTicket ${index + 1}:`);
        console.log(`   Ticket ID: ${ticket._id}`);
        console.log(`   Ticket Number: ${ticket.ticketNumber}`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   Event ID: ${ticket.event}`);
        console.log(`   Event Type: ${ticket.eventType}`);
        console.log(`   User ID: ${ticket.user}`);
        console.log(`   Purchase Date: ${ticket.purchaseDate}`);
        console.log(`   Price: $${ticket.price}`);
        console.log(`   Seat Info: ${JSON.stringify(ticket.seatInfo)}`);
        console.log(`   Ticket Details: ${JSON.stringify(ticket.ticketDetails)}`);
        
        if (ticket.status === 'cancelled') {
          console.log(`   Cancelled At: ${ticket.cancelledAt}`);
          console.log(`   Cancellation Reason: ${ticket.cancellationReason}`);
        }
      });
    } else {
      console.log('❌ No tickets found in database');
    }

    // Get all orders
    console.log('\n📋 All Orders in Database:');
    const allOrders = await Order.find({});
    
    console.log(`Found ${allOrders.length} orders total`);
    
    if (allOrders.length > 0) {
      allOrders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Event Name: ${order.eventName}`);
        console.log(`   Event Type: ${order.eventType}`);
        console.log(`   Customer: ${order.customerInfo.name} (${order.customerInfo.email})`);
        console.log(`   Total Amount: $${order.totalAmount}`);
        console.log(`   Created At: ${order.createdAt}`);
        console.log(`   Updated At: ${order.updatedAt}`);
      });
    } else {
      console.log('❌ No orders found in database');
    }

    // Get all users
    console.log('\n👤 All Users in Database:');
    const allUsers = await User.find({});
    
    console.log(`Found ${allUsers.length} users total`);
    
    if (allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created At: ${user.createdAt}`);
      });
    } else {
      console.log('❌ No users found in database');
    }

    // Check for tickets with specific patterns
    console.log('\n🔍 Searching for tickets with specific patterns...');
    
    // Search for tickets with "Angry" in event name
    const angryTickets = await Ticket.find({ 
      'ticketDetails.eventName': { $regex: /angry/i }
    });
    console.log(`Tickets with "Angry" in event name: ${angryTickets.length}`);
    
    // Search for tickets with "12" in event name
    const twelveTickets = await Ticket.find({ 
      'ticketDetails.eventName': { $regex: /12/i }
    });
    console.log(`Tickets with "12" in event name: ${twelveTickets.length}`);
    
    // Search for tickets with "Men" in event name
    const menTickets = await Ticket.find({ 
      'ticketDetails.eventName': { $regex: /men/i }
    });
    console.log(`Tickets with "Men" in event name: ${menTickets.length}`);

    console.log('\n🎯 All Tickets Investigation Results:');
    console.log('====================================');
    console.log(`✅ Total tickets: ${allTickets.length}`);
    console.log(`✅ Total orders: ${allOrders.length}`);
    console.log(`✅ Total users: ${allUsers.length}`);
    console.log(`✅ Cancelled tickets: ${allTickets.filter(t => t.status === 'cancelled').length}`);
    console.log(`✅ Active tickets: ${allTickets.filter(t => t.status === 'active').length}`);

    console.log('\n💡 Next Steps:');
    console.log('==============');
    if (allTickets.length === 0) {
      console.log('❌ No tickets found - you may need to purchase tickets first');
      console.log('✅ Go to an event page and buy tickets to test the system');
    } else {
      console.log('✅ Tickets found - check the My Tickets page');
      console.log('✅ Look for tickets with status "cancelled" to see strikethrough styling');
    }

    console.log('\n✨ All tickets investigation completed! ✨');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAllTickets();
