const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

router.post('/create', async (req, res) => {
  try {
    console.log('📝 Ticket creation request:', req.body);
    
    const { eventId, eventType, userId, seats, price } = req.body;
    
    // Validate required fields
    if (!eventId) return res.status(400).send('Missing eventId');
    if (!userId) return res.status(400).send('Missing userId');
    if (!seats || seats.length === 0) return res.status(400).send('Missing seats data');
    if (!price) return res.status(400).send('Missing price');

    console.log(`🔍 Looking for event: ${eventId} (type: ${eventType})`);

    // ✅ Find event by eventType
    let event;
    if (eventType.toLowerCase().includes('movie')) {
      event = await Movie.findById(eventId);
      console.log(`📽️ Movie search result:`, event ? event.name : 'Not found');
    } else if (eventType.toLowerCase().includes('stage')) {
      event = await StagePlays.findById(eventId);
      console.log(`🎭 StagePlay search result:`, event ? event.name : 'Not found');
    } else if (eventType.toLowerCase().includes('orchestra')) {
      event = await LiveOrchestra.findById(eventId);
      console.log(`🎼 LiveOrchestra search result:`, event ? event.name : 'Not found');
    }

    if (!event) {
      console.log(`❌ Event not found: ${eventId}`);
      return res.status(404).send(`Event not found: ${eventId}`);
    }

    // ✅ Check for seat conflicts
    const existingTickets = await Ticket.find({ event: eventId, 'seatInfo.seatNumber': { $in: seats } });
    const alreadyBooked = existingTickets.map(t => t.seatInfo.seatNumber);
    const availableSeats = seats.filter(s => !alreadyBooked.includes(s));

    if (availableSeats.length === 0) {
      return res.status(400).send('❌ All selected seats are already booked.');
    }

    // ✅ Create tickets for available seats only
    console.log(`🎫 Creating tickets for ${availableSeats.length} available seats:`, availableSeats);
    
    for (const seat of availableSeats) {
      const ticket = new Ticket({
        event: eventId,
        eventType: eventType || 'Movie',
        user: userId,
        price,
        seatInfo: {
          seatNumber: seat,
          section: 'General',
          row: seat.charAt(0),
          seat: seat.substring(1)
        },
        ticketDetails: {
          category: event.category || eventType,
          eventName: event.name,
          eventDate: event.date,
          venue: event.location?.name || 'Unknown Venue',
          organizer: event.organizer?.name || 'Unknown Organizer'
        }
      });

      console.log(`📝 Creating ticket for seat ${seat}...`);
      await ticket.save();
      console.log(`✅ Ticket created: ${ticket.ticketNumber} (QR: ${ticket.qrCode})`);
    }

    console.log(`🎉 Successfully created ${availableSeats.length} ticket(s)`);
    res.send(`✅ ${availableSeats.length} ticket(s) created successfully.`);
  } catch (err) {
    console.error('❌ Ticket Creation Error:', err);
    res.status(500).send('Error creating tickets: ' + err.message);
  }
});

// ✅ แสดงตั๋วเฉพาะ event นั้น
router.get('/my-tickets/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the event first
    let event = await Movie.findById(eventId);
    if (!event) {
      event = await StagePlays.findById(eventId);
    }
    if (!event) {
      event = await LiveOrchestra.findById(eventId);
    }

    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        message: 'The requested event could not be found.'
      });
    }

    const tickets = await Ticket.find({ event: eventId }).sort({ purchaseDate: -1 });

    res.render('my-tickets', { 
      tickets,
      title: '🎟️ บัตรของฉัน'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { 
      title: 'Server Error',
      message: 'Error loading tickets: ' + err.message
    });
  }
});

module.exports = router;
