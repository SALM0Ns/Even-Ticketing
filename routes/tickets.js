const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Purchase ticket with QR code generation
router.post('/purchase', async (req, res) => {
  try {
    // 🧱 Mock user for development
    if (!req.session || !req.session.user) {
      req.session.user = {
        _id: '6722a0f5c2a69b7b5b01f9a1',
        username: 'MockUser'
      };
    }

    const userId = req.session.user._id;
    const { eventId, eventType, seatNumber, price } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }

    // Find the event based on type/category
    let event = null;
    let actualCategory = eventType;
    
    // Normalize event type to handle both formats
    switch (eventType) {
      case 'movie':
      case 'movies':
        event = await Movie.findById(eventId);
        actualCategory = 'movies';
        break;
      case 'stage-play':
      case 'stage-plays':
        event = await StagePlays.findById(eventId);
        actualCategory = 'stage-plays';
        break;
      case 'orchestra':
      case 'live-orchestra':
        event = await LiveOrchestra.findById(eventId);
        actualCategory = 'orchestra';
        break;
      default:
        return res.status(400).json({ error: 'Invalid event type or category' });
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 🎟️ Generate QR Code text
    const qrCodeValue = `${userId}-${eventId}-${Date.now()}`;

    // Create new ticket
    const ticket = new Ticket({
      ticketNumber: `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: userId,
      event: eventId,
      seatNumber: seatNumber || 'General',
      price: price || event.pricing.basePrice,
      qrCode: qrCodeValue,
      status: 'active',
      ticketDetails: {
        category: actualCategory,
        eventName: event.name,
        eventDate: event.date,
        venue: event.location.name,
        organizer: event.organizer || 'Event Organizer'
      }
    });

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket purchased successfully!',
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        eventName: event.name,
        date: event.date,
        location: event.location.name,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        qrCode: qrCodeValue
      }
    });
  } catch (error) {
    console.error('❌ Purchase failed:', error);
    res.status(500).json({ error: 'Failed to purchase ticket' });
  }
});

// 🧾 Route: My Tickets Page
router.get('/my-tickets', async (req, res) => {
  try {
    // 👤 Mock user (since login is not ready yet)
    if (!req.session || !req.session.user) {
      req.session.user = {
        _id: new mongoose.Types.ObjectId('6722a0f5c2a69b7b5b01f9a1'),
        username: 'MockUser'
      };
    }

    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    // 🎟 Fetch all tickets for this user
    const tickets = await Ticket.find({ user: userId })
      .populate({
        path: 'event',
        select: 'name location date category image'
      })
      .sort({ purchaseDate: -1 })
      .lean();

    console.log('🎟 Tickets found:', tickets);

    // If no tickets in database, return mock data for demo
    if (tickets.length === 0) {
      const mockTickets = [
        {
          _id: 'ticket_001',
          ticketNumber: 'TK-001',
          eventName: 'Beethoven Symphony No. 9',
          date: '2024-02-15',
          location: 'Royal Concert Hall',
          seatNumber: 'A-12',
          price: 85,
          status: 'active',
          imageUrl: '/images/beethoven9-poster.jpg',
          category: 'orchestra',
          qrCode: '6722a0f5c2a69b7b5b01f9a1-mock-event-001-1703000000000'
        },
        {
          _id: 'ticket_002', 
          ticketNumber: 'TK-002',
          eventName: 'Inception',
          date: '2024-02-20',
          location: 'Cinema Palace',
          seatNumber: 'B-8',
          price: 15,
          status: 'active',
          imageUrl: '/images/inception.jpg',
          category: 'movies',
          qrCode: '6722a0f5c2a69b7b5b01f9a1-mock-event-002-1703000000001'
        },
        {
          _id: 'ticket_003',
          ticketNumber: 'TK-003',
          eventName: 'Hamilton',
          date: '2024-02-25',
          location: 'Broadway Theater',
          seatNumber: 'C-15',
          price: 120,
          status: 'active',
          imageUrl: '/images/hamilton.jpg',
          category: 'stage-plays',
          qrCode: '6722a0f5c2a69b7b5b01f9a1-mock-event-003-1703000000002'
        }
      ];

      return res.render('my-tickets', {
        title: 'My Tickets',
        user: req.session.user,
        tickets: mockTickets
      });
    }

    // Transform tickets for display
    const transformedTickets = tickets.map(ticket => ({
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      eventName: ticket.ticketDetails?.eventName || ticket.event?.name || 'Unknown Event',
      date: ticket.ticketDetails?.eventDate || ticket.event?.date || new Date(),
      location: ticket.ticketDetails?.venue || ticket.event?.location?.name || 'No location info',
      seatNumber: ticket.seatNumber || 'General',
      price: ticket.price || 0,
      status: ticket.status || 'active',
      category: ticket.ticketDetails?.category || 'unknown',
      qrCode: ticket.qrCode,
      imageUrl: ticket.event?.image || '/images/default-event.jpg'
    }));

    // 🖼 Render EJS safely
    res.render('my-tickets', {
      title: 'My Tickets',
      user: req.session.user,
      tickets: transformedTickets
    });
  } catch (error) {
    console.error('❌ Error loading tickets:', error);
    res.status(500).render('500', {
      title: 'Server Error',
      message: 'Failed to load tickets',
      error: error?.message || 'Unknown error'
    });
  }
});

// 🧩 Debug route to test DB connection
router.get('/debug', async (req, res) => {
  try {
    const count = await Ticket.countDocuments();
    res.send(`✅ DB Connected. Tickets: ${count}`);
  } catch (error) {
    res.send(`❌ DB Error: ${error.message}`);
  }
});

// Get available events for testing
router.get('/test-events', async (req, res) => {
  try {
    const movies = await Movie.find().limit(3);
    const stagePlays = await StagePlays.find().limit(3);
    const liveOrchestra = await LiveOrchestra.find().limit(3);
    
    res.json({
      movies: movies.map(m => ({ id: m._id, name: m.name, category: 'movies' })),
      stagePlays: stagePlays.map(s => ({ id: s._id, name: s.name, category: 'stage-plays' })),
      liveOrchestra: liveOrchestra.map(l => ({ id: l._id, name: l.name, category: 'orchestra' }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate ticket by QR code
router.get('/validate/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    
    const ticket = await Ticket.findOne({ qrCode })
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.json({
        valid: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'active') {
      return res.json({
        valid: false,
        message: `Ticket is ${ticket.status}`
      });
    }

    res.json({
      valid: true,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        eventName: ticket.ticketDetails.eventName,
        eventDate: ticket.ticketDetails.eventDate,
        venue: ticket.ticketDetails.venue,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

module.exports = router;
