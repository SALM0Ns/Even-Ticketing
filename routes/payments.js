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

    if (!event) {
      console.error('Event not found for seat availability update');
      return;
    }

    // Update taken seats for the specific show date
    const showDate = new Date(order.event.showDate);
    
    if (event.showDates && event.showDates.length > 0) {
      // Find the matching show date
      const showDateIndex = event.showDates.findIndex(show => {
        const eventDate = new Date(show.date);
        return eventDate.getTime() === showDate.getTime();
      });
      
      if (showDateIndex !== -1 && event.showDates[showDateIndex].seating) {
        const seating = event.showDates[showDateIndex].seating;
        
        // Add taken seats
        order.tickets.forEach(ticket => {
          const seatNumber = parseInt(ticket.seatNumber);
          if (!seating.takenSeats.includes(seatNumber)) {
            seating.takenSeats.push(seatNumber);
          }
        });
        
        // Update available seats count
        seating.availableSeats = seating.totalSeats - seating.takenSeats.length;
        
        // Mark as modified to ensure save
        event.markModified('showDates');
        await event.save();
        
        console.log(`✅ Updated seat availability for ${event.name} on ${showDate.toLocaleDateString()}`);
        console.log(`   - Taken seats: ${seating.takenSeats.length}/${seating.totalSeats}`);
        console.log(`   - Available seats: ${seating.availableSeats}`);
      } else {
        console.error('Show date not found or seating data missing');
      }
    } else {
      console.error('No show dates found for event');
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

// Cancel ticket
router.post('/cancel-ticket', async (req, res) => {
  try {
    const { ticketId, reason } = req.body;
    const userId = req.session && req.session.user ? req.session.user.id : null;
    const email = req.session && req.session.user ? req.session.user.email : null;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    // Find the ticket
    const ticket = await UserTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns this ticket
    const isOwner = (userId && ticket.user && ticket.user.toString() === userId) ||
                   (email && ticket.customer.email === email);
    
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this ticket'
      });
    }

    // Check if ticket can be cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already cancelled'
      });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a ticket that has already been used'
      });
    }

    // Check if event date has passed
    const eventDate = new Date(ticket.event.showDate);
    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel ticket for an event that has already occurred'
      });
    }

    // Cancel the ticket
    ticket.status = 'cancelled';
    ticket.cancelledAt = new Date();
    ticket.cancellationReason = reason || 'Cancelled by user';
    await ticket.save();

    // Also cancel the associated order if it exists
    if (ticket.order) {
      const order = await Order.findById(ticket.order);
      if (order && order.orderStatus !== 'cancelled') {
        order.orderStatus = 'cancelled';
        order.notes = `Ticket cancelled: ${reason || 'Cancelled by user'}`;
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      ticket: {
        id: ticket._id,
        status: ticket.status,
        cancelledAt: ticket.cancelledAt,
        cancellationReason: ticket.cancellationReason
      }
    });

  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ticket'
    });
  }
});

// Get seat availability for a specific show date
router.get('/seat-availability/:eventId/:showDate', async (req, res) => {
  try {
    const { eventId, showDate } = req.params;
    const showDateObj = new Date(showDate);

    // Find the event
    let event = await Movie.findById(eventId);
    if (!event) {
      event = await StagePlays.findById(eventId);
    }
    if (!event) {
      event = await LiveOrchestra.findById(eventId);
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the specific show date
    const showDateIndex = event.showDates.findIndex(show => {
      const eventDate = new Date(show.date);
      return eventDate.getTime() === showDateObj.getTime();
    });

    if (showDateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Show date not found'
      });
    }

    const seating = event.showDates[showDateIndex].seating;
    
    res.json({
      success: true,
      data: {
        totalSeats: seating.totalSeats,
        takenSeats: seating.takenSeats,
        availableSeats: seating.availableSeats,
        showDate: showDate
      }
    });

  } catch (error) {
    console.error('Error getting seat availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat availability'
    });
  }
});

// Lock seats temporarily during booking process
router.post('/lock-seats', async (req, res) => {
  try {
    const { eventId, showDate, seatNumbers } = req.body;

    if (!eventId || !showDate || !seatNumbers || !Array.isArray(seatNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const showDateObj = new Date(showDate);

    // Find the event
    let event = await Movie.findById(eventId);
    if (!event) {
      event = await StagePlays.findById(eventId);
    }
    if (!event) {
      event = await LiveOrchestra.findById(eventId);
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the specific show date
    const showDateIndex = event.showDates.findIndex(show => {
      const eventDate = new Date(show.date);
      return eventDate.getTime() === showDateObj.getTime();
    });

    if (showDateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Show date not found'
      });
    }

    const seating = event.showDates[showDateIndex].seating;
    
    // Check if seats are available
    const unavailableSeats = seatNumbers.filter(seatNum => 
      seating.takenSeats.includes(parseInt(seatNum))
    );

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats
      });
    }

    // Seats are available - return success
    res.json({
      success: true,
      message: 'Seats are available for booking',
      availableSeats: seatNumbers
    });

  } catch (error) {
    console.error('Error locking seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lock seats'
    });
  }
});

// Release seats if booking is cancelled
router.post('/release-seats', async (req, res) => {
  try {
    const { eventId, showDate, seatNumbers } = req.body;

    if (!eventId || !showDate || !seatNumbers || !Array.isArray(seatNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // This endpoint is for future use if we implement temporary seat locking
    // For now, seats are only locked during the actual booking process
    
    res.json({
      success: true,
      message: 'Seats released successfully'
    });

  } catch (error) {
    console.error('Error releasing seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release seats'
    });
  }
});

module.exports = router;
