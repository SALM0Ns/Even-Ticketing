const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const UserTicket = require('../models/UserTicket');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Helper function to update seat availability
async function updateSeatAvailability(order) {
  try {
    let event;
    switch (order.event.eventType) {
      case 'Movie':
      case 'movies':
        event = await Movie.findById(order.event.eventId);
        break;
      case 'StagePlays':
      case 'stage-plays':
        event = await StagePlays.findById(order.event.eventId);
        break;
      case 'LiveOrchestra':
      case 'orchestra':
      case 'live-orchestra':
        event = await LiveOrchestra.findById(order.event.eventId);
        break;
    }

    if (!event) return;

    // Update taken seats for the specific show date
    const showDate = new Date(order.event.showDate);
    const showDateStr = showDate.toISOString().split('T')[0];
    
    if (event.showDates && event.showDates.length > 0) {
      const showDateIndex = event.showDates.findIndex(date => {
        const eventDate = new Date(date);
        return eventDate.toISOString().split('T')[0] === showDateStr;
      });
      
      if (showDateIndex !== -1 && event.seating && event.seating[showDateIndex]) {
        // Add taken seats
        order.tickets.forEach(ticket => {
          if (!event.seating[showDateIndex].takenSeats.includes(ticket.seatNumber)) {
            event.seating[showDateIndex].takenSeats.push(ticket.seatNumber);
          }
        });
        
        // Update available seats count
        event.seating[showDateIndex].availableSeats = 
          event.seating[showDateIndex].totalSeats - event.seating[showDateIndex].takenSeats.length;
        
        await event.save();
        console.log(`Updated seat availability for ${event.name} on ${showDateStr}`);
      }
    }
  } catch (error) {
    console.error('Error updating seat availability:', error);
  }
}

// Helper function to create user ticket
async function createUserTicket(order, userId) {
  try {
    const userTicket = new UserTicket({
      user: userId,
      order: order._id,
      event: {
        eventId: order.event.eventId,
        eventName: order.event.eventName,
        eventType: order.event.eventType,
        showDate: order.event.showDate,
        venue: order.event.venue
      },
      tickets: order.tickets,
      customer: order.customer,
      totalAmount: order.pricing.total,
      status: 'active'
    });

    await userTicket.save();
    console.log(`Created user ticket for ${order.customer.name}`);
  } catch (error) {
    console.error('Error creating user ticket:', error);
  }
}

// Create order from seat selection
router.post('/create-order', async (req, res) => {
  try {
    const { eventId, eventType, showDate, selectedSeats, customerInfo } = req.body;

    // Validate required fields
    if (!eventId || !eventType || !showDate || !selectedSeats || !customerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get event details
    let event;
    switch (eventType) {
      case 'Movie':
      case 'movies':
        event = await Movie.findById(eventId);
        break;
      case 'StagePlays':
      case 'stage-plays':
        event = await StagePlays.findById(eventId);
        break;
      case 'LiveOrchestra':
      case 'orchestra':
      case 'live-orchestra':
        event = await LiveOrchestra.findById(eventId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid event type'
        });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Create tickets array
    const tickets = selectedSeats.map(seat => ({
      seatNumber: seat.seatNumber,
      seatType: seat.seatType || 'standard',
      price: seat.price
    }));

    // Create order
    const customerName = customerInfo.name || `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim();
    
    const order = new Order({
      customer: {
        name: customerName,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      event: {
        eventId: event._id,
        eventName: event.name,
        eventType: eventType,
        showDate: new Date(showDate),
        venue: event.location
      },
      tickets: tickets
    });

    // Calculate pricing
    order.calculatePricing();
    
    // Generate order number if not exists
    if (!order.orderNumber) {
      const count = await Order.countDocuments();
      order.orderNumber = `CT${Date.now().toString().slice(-8)}${(count + 1).toString().padStart(4, '0')}`;
    }
    
    await order.save();

    res.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        formattedTotal: order.formattedTotal,
        expiresAt: order.expiresAt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get order details
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Process payment
router.post('/process-payment', async (req, res) => {
  try {
    const { orderId, paymentMethod, cardDetails } = req.body;
    const userId = req.session && req.session.user ? req.session.user.id : null; // Get user ID from session or null for guest

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Simulate payment gateway processing
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate

    const newPayment = new Payment({
      order: order._id,
      user: userId,
      amount: order.pricing.total,
      currency: 'USD',
      paymentMethod: paymentMethod,
      transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      status: isPaymentSuccessful ? 'completed' : 'failed',
      gatewayResponse: {
        simulated: true,
        success: isPaymentSuccessful,
        message: isPaymentSuccessful ? 'Payment successful' : 'Payment failed due to simulated error'
      }
    });

    await newPayment.save();

    order.paymentStatus = isPaymentSuccessful ? 'completed' : 'failed';
    order.orderStatus = isPaymentSuccessful ? 'paid' : 'cancelled';
    await order.save();

    // Update seat availability and create user ticket if payment successful
    if (isPaymentSuccessful) {
      await updateSeatAvailability(order);
      await createUserTicket(order, userId);
    }

    if (!isPaymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        paymentId: newPayment._id,
        orderStatus: order.orderStatus
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentId: newPayment._id,
      orderId: order._id
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
});

// Get user tickets
router.get('/user-tickets', async (req, res) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : null;
    const email = req.query.email;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email required'
      });
    }

    const tickets = await UserTicket.findUserTickets(userId, email);
    
    res.json({
      success: true,
      tickets: tickets
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user tickets'
    });
  }
});

module.exports = router;
