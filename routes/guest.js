const express = require('express');
const router = express.Router();

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// GET /guest/events - View all events (Guest access)
router.get('/events', async (req, res) => {
  try {
    // Get events from all categories
    const movies = await Movie.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
    const stagePlays = await StagePlays.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
    const orchestra = await LiveOrchestra.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
    
    // Add category to each event
    const allEvents = [
      ...movies.map(movie => ({ ...movie.toObject(), category: 'movies' })),
      ...stagePlays.map(play => ({ ...play.toObject(), category: 'stage-plays' })),
      ...orchestra.map(concert => ({ ...concert.toObject(), category: 'orchestra' }))
    ];
    
    res.render('guest/events', {
      title: 'All Events - CursedTicket',
      events: allEvents
    });
  } catch (error) {
    console.error('Error loading events:', error);
    req.flash('error', 'Failed to load events');
    res.render('guest/events', {
      title: 'All Events - CursedTicket',
      events: []
    });
  }
});

// GET /guest/events/:id - View event details (Guest access)
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the event in all categories
    let event = await Movie.findById(id).populate('organizer', 'name');
    let eventType = 'movies';
    
    if (!event) {
      event = await StagePlays.findById(id).populate('organizer', 'name');
      eventType = 'stage-plays';
    }
    
    if (!event) {
      event = await LiveOrchestra.findById(id).populate('organizer', 'name');
      eventType = 'orchestra';
    }
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/guest/events');
    }
    
    // Add category to event
    const eventWithCategory = { ...event.toObject(), category: eventType };
    
    res.render('guest/event-details', {
      title: `${event.name} - CursedTicket`,
      event: eventWithCategory
    });
  } catch (error) {
    console.error('Error loading event details:', error);
    req.flash('error', 'Failed to load event details');
    res.redirect('/guest/events');
  }
});

// GET /guest/events/category/:category - View events by category (Guest access)
router.get('/events/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    let events = [];
    
    switch (category) {
      case 'movies':
        events = await Movie.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
        break;
      case 'stage-plays':
        events = await StagePlays.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
        break;
      case 'orchestra':
        events = await LiveOrchestra.find({ status: 'upcoming' }).populate('organizer', 'name').sort({ date: 1 });
        break;
      default:
        req.flash('error', 'Invalid category');
        return res.redirect('/guest/events');
    }
    
    // Add category to events
    const eventsWithCategory = events.map(event => ({ ...event.toObject(), category }));
    
    res.render('guest/events', {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Events - CursedTicket`,
      events: eventsWithCategory,
      category: category
    });
  } catch (error) {
    console.error('Error loading events by category:', error);
    req.flash('error', 'Failed to load events');
    res.redirect('/guest/events');
  }
});

module.exports = router;
