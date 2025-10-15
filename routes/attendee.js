const express = require('express');
const router = express.Router();
const { requireAttendee } = require('../middleware/permissions');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

const EVENT_SOURCES = [
  { model: Movie, category: 'movies' },
  { model: StagePlays, category: 'stage-plays' },
  { model: LiveOrchestra, category: 'orchestra' }
];

const findEventById = async (eventId, { includeOrganizer = false } = {}) => {
  for (const source of EVENT_SOURCES) {
    const query = source.model.findById(eventId);
    if (includeOrganizer) {
      query.populate('organizer', 'name email');
    }

    const event = await query.exec();
    if (event) {
      return {
        event,
        category: source.category,
        eventModel: source.model.modelName
      };
    }
  }

  return null;
};

const resolvePricing = (event, requestedType) => {
  const normalizedType = ['regular', 'student', 'senior', 'vip'].includes(requestedType)
    ? requestedType
    : 'regular';

  const pricing = event?.pricing || {};
  const pricingMap = {
    regular: pricing.basePrice,
    student: pricing.studentPrice,
    senior: pricing.seniorPrice,
    vip: pricing.vipPrice
  };

  const selectedPrice = pricingMap[normalizedType];
  if (selectedPrice === undefined || selectedPrice === null) {
    return {
      price: Number(pricing.basePrice || 0),
      pricingType: 'regular'
    };
  }

  return {
    price: Number(selectedPrice),
    pricingType: normalizedType
  };
};

// GET /attendee/profile - Edit personal profile (Attendee only)
router.get('/profile', requireAttendee, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('attendee/profile', {
      title: 'Edit Profile - CursedTicket',
      user: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    req.flash('error', 'Failed to load profile');
    res.redirect('/');
  }
});

// POST /attendee/profile - Update personal profile
router.post('/profile', requireAttendee, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, preferences } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }
    
    // Update profile
    user.name = name || user.name;
    user.profile.phone = phone || user.profile.phone;
    user.profile.dateOfBirth = dateOfBirth || user.profile.dateOfBirth;
    
    if (preferences && preferences.categories) {
      user.profile.preferences.categories = Array.isArray(preferences.categories) 
        ? preferences.categories 
        : [preferences.categories];
    }
    
    await user.save();
    
    // Update session
    req.session.user.name = user.name;
    
    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    req.flash('error', 'Failed to update profile');
    res.redirect('/attendee/profile');
  }
});

// GET /attendee/tickets - View ticket history (Attendee only)
router.get('/tickets', requireAttendee, async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByUser(req.session.user.id);
    
    res.render('attendee/tickets', {
      title: 'My Tickets - CursedTicket',
      tickets: tickets
    });
  } catch (error) {
    console.error('Tickets error:', error);
    req.flash('error', 'Failed to load tickets');
    res.redirect('/');
  }
});

// GET /attendee/buy/:eventId - Buy tickets for an event (Attendee only)
router.get('/buy/:eventId', requireAttendee, async (req, res) => {
  try {
    const { eventId } = req.params;

    const lookup = await findEventById(eventId, { includeOrganizer: true });
    if (!lookup) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    res.render('attendee/buy-ticket', {
      title: `Buy Tickets - ${lookup.event.name}`,
      event: lookup.event,
      eventType: lookup.category
    });
  } catch (error) {
    console.error('Buy ticket error:', error);
    req.flash('error', 'Failed to load event');
    res.redirect('/events');
  }
});

// POST /attendee/buy/:eventId - Process ticket purchase
router.post('/buy/:eventId', requireAttendee, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { quantity, pricingType } = req.body;

    const lookup = await findEventById(eventId, { includeOrganizer: true });
    if (!lookup) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      req.flash('error', 'Please select a valid ticket quantity.');
      return res.redirect(`/attendee/buy/${eventId}`);
    }

    const safeQuantity = Math.min(parsedQuantity, 10);
    const pricingResult = resolvePricing(lookup.event, pricingType);

    if (!Number.isFinite(pricingResult.price) || pricingResult.price < 0) {
      req.flash('error', 'Pricing information is unavailable for this event.');
      return res.redirect(`/attendee/buy/${eventId}`);
    }

    const organizerName = lookup.event.organizer?.name || 'Unknown';
    const ticketPromises = [];

    for (let i = 0; i < safeQuantity; i += 1) {
      const ticket = new Ticket({
        ticketNumber: `TK${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        event: lookup.event._id,
        eventModel: lookup.eventModel,
        user: req.session.user.id,
        price: pricingResult.price,
        pricingType: pricingResult.pricingType,
        ticketDetails: {
          category: lookup.category,
          eventName: lookup.event.name,
          eventDate: lookup.event.date,
          venue: lookup.event.location?.name || 'TBA',
          organizer: organizerName
        }
      });

      ticketPromises.push(ticket.save());
    }

    await Promise.all(ticketPromises);

    req.flash('success', `Successfully purchased ${safeQuantity} ticket(s) for ${lookup.event.name}`);
    return res.redirect('/attendee/tickets');
  } catch (error) {
    console.error('Ticket purchase error:', error);
    req.flash('error', 'Failed to purchase tickets');
    return res.redirect(`/attendee/buy/${req.params.eventId}`);
  }
});

module.exports = router;
