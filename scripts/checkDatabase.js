const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const UserTicket = require('../models/UserTicket');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check Orders
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n📋 Recent Orders:');
    orders.forEach(order => {
      console.log(`- Order: ${order.orderNumber}`);
      console.log(`  Event: ${order.event.eventName}`);
      console.log(`  Customer: ${order.customer.name}`);
      console.log(`  Status: ${order.orderStatus}`);
      console.log(`  Total: $${order.pricing.total}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log('');
    });

    // Check Payments
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(5);
    console.log('💳 Recent Payments:');
    payments.forEach(payment => {
      console.log(`- Payment ID: ${payment._id}`);
      console.log(`  Order: ${payment.order}`);
      console.log(`  Amount: $${payment.amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Method: ${payment.paymentMethod}`);
      console.log(`  Created: ${payment.createdAt}`);
      console.log('');
    });

    // Check User Tickets
    const userTickets = await UserTicket.find().sort({ createdAt: -1 }).limit(5);
    console.log('🎫 Recent User Tickets:');
    userTickets.forEach(ticket => {
      console.log(`- Ticket ID: ${ticket._id}`);
      console.log(`  Event: ${ticket.event.eventName}`);
      console.log(`  Customer: ${ticket.customer.name}`);
      console.log(`  Seats: ${ticket.tickets.map(t => t.seatNumber).join(', ')}`);
      console.log(`  Status: ${ticket.status}`);
      console.log(`  Total: $${ticket.totalAmount}`);
      console.log(`  Created: ${ticket.createdAt}`);
      console.log('');
    });

    // Check specific test user
    const testUserTickets = await UserTicket.find({ 'customer.email': 'dbtest@test.com' });
    console.log('🧪 Test User Tickets (dbtest@test.com):');
    testUserTickets.forEach(ticket => {
      console.log(`- Event: ${ticket.event.eventName}`);
      console.log(`  Seats: ${ticket.tickets.map(t => `${t.seatNumber} (${t.seatType})`).join(', ')}`);
      console.log(`  Ticket IDs: ${ticket.tickets.map(t => t.ticketId).join(', ')}`);
      console.log(`  Status: ${ticket.status}`);
      console.log('');
    });

    console.log('✅ Database check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
