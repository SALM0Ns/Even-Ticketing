const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
// const User = require('../models/User'); // Commented out User model import to fix populate error

// Get all events (with category filtering)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let events = [];

    if (category) {
      switch (category) {
        case 'movies':
          events = await Movie.find();
          events = events.map(event => ({ ...event.toObject(), category: 'movies' }));
          break;
        case 'stage-plays':
          events = await StagePlays.find();
          events = events.map(event => ({ ...event.toObject(), category: 'stage-plays' }));
          break;
        case 'orchestra':
        case 'live-orchestra':
          events = await LiveOrchestra.find();
          events = events.map(event => ({ ...event.toObject(), category: 'orchestra' }));
          break;
        default:
          // Get events from all categories
          const movies = await Movie.find();
          const plays = await StagePlays.find();
          const orchestra = await LiveOrchestra.find();
          events = [
            ...movies.map(event => ({ ...event.toObject(), category: 'movies' })),
            ...plays.map(event => ({ ...event.toObject(), category: 'stage-plays' })),
            ...orchestra.map(event => ({ ...event.toObject(), category: 'orchestra' }))
          ];
      }
    } else {
      // Get events from all categories
        const movies = await Movie.find();
        const plays = await StagePlays.find();
        const orchestra = await LiveOrchestra.find();
      events = [
        ...movies.map(event => ({ ...event.toObject(), category: 'movies' })),
        ...plays.map(event => ({ ...event.toObject(), category: 'stage-plays' })),
        ...orchestra.map(event => ({ ...event.toObject(), category: 'orchestra' }))
      ];
    }

    // Search functionality
    if (search) {
      events = events.filter(event => 
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.render('events/index', {
      title: 'All Events',
      events,
      currentCategory: category || 'all',
      searchQuery: search || ''
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).render('500', { 
      title: 'Server Error',
      error: 'Failed to load events'
    });
  }
});

// Get individual event by ID and category
router.get('/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params;
    let event = null;
    let model = null;

    // Determine which model to use based on category
    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
      case 'live-orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).render('404', { 
          title: 'Event Not Found',
          error: 'Invalid event category'
        });
    }

    // Find the event
    event = await model.findById(id);
    
    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        error: 'Event not found'
      });
    }

    // Get related events from the same category
    const relatedEvents = await model.find({ 
      _id: { $ne: id }
    }).limit(4);

    res.render('events/show', {
      title: event.name,
      event,
      category,
      relatedEvents,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).render('500', { 
      title: 'Server Error',
      error: 'Failed to load event details'
    });
  }
});

// Get event by ID only (for backward compatibility)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let event = null;
    let category = null;

    // Try to find in each collection
    event = await Movie.findById(id);
    if (event) {
      category = 'movies';
    } else {
      event = await StagePlays.findById(id);
      if (event) {
        category = 'stage-plays';
      } else {
        event = await LiveOrchestra.findById(id);
        if (event) {
          category = 'orchestra';
        }
      }
    }

    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        error: 'Event not found'
      });
    }

    // Get related events from the same category
    let relatedEvents = [];
    if (category === 'movies') {
      relatedEvents = await Movie.find({ _id: { $ne: id } }).limit(4);
    } else if (category === 'stage-plays') {
      relatedEvents = await StagePlays.find({ _id: { $ne: id } }).limit(4);
    } else if (category === 'orchestra') {
      relatedEvents = await LiveOrchestra.find({ _id: { $ne: id } }).limit(4);
    }

    res.render('events/show', {
      title: event.name,
      event,
      category,
      relatedEvents,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).render('500', { 
      title: 'Server Error',
      error: 'Failed to load event details'
    });
  }
});

// GET /events/:id/book - Display booking page for an event
router.get('/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    let event = null;
    let eventType = null;

    // Try to find the event in each collection
    event = await Movie.findById(id);
    if (event) {
      eventType = 'movie';
    } else {
      event = await StagePlays.findById(id);
      if (event) {
        eventType = 'stage-play';
      } else {
        event = await LiveOrchestra.findById(id);
        if (event) {
          eventType = 'orchestra';
        }
      }
    }

    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    res.render('events/book', {
      title: `Book ${event.name}`,
      event,
      eventType
    });
  } catch (error) {
    console.error('Error fetching event for booking:', error);
    req.flash('error', 'Failed to load booking page');
    res.redirect('/events');
  }
});

module.exports = router;
