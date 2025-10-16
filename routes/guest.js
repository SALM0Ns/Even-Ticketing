const express = require('express');
const router = express.Router();

// Guest Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    res.render('guest/dashboard', {
      title: 'Welcome to CursedTicket',
      user: null // Guest users don't have session
    });
  } catch (error) {
    console.error('Error rendering guest dashboard:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
});

// Browse Events (Guest can view but not purchase)
router.get('/events', async (req, res) => {
  try {
    // Redirect to main events page
    res.redirect('/events');
  } catch (error) {
    console.error('Error redirecting to events:', error);
    res.redirect('/');
  }
});

// View Event Details (Guest can view but not purchase)
router.get('/events/:category/:eventId', async (req, res) => {
  try {
    const { category, eventId } = req.params;
    
    // Get event details based on category
    let event = null;
    
    switch (category) {
      case 'movies':
        const Movie = require('../models/Movie');
        event = await Movie.findById(eventId);
        break;
      case 'stage-plays':
        const StagePlays = require('../models/StagePlays');
        event = await StagePlays.findById(eventId);
        break;
      case 'orchestra':
      case 'live-orchestra':
        const LiveOrchestra = require('../models/LiveOrchestra');
        event = await LiveOrchestra.findById(eventId);
        break;
      default:
        req.flash('error', 'Invalid event category');
        return res.redirect('/events');
    }
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    res.render('events/show', {
      title: `${event.name} - CursedTicket`,
      event: event,
      eventType: category,
      user: null // Guest user
    });
  } catch (error) {
    console.error('Error loading event details:', error);
    req.flash('error', 'Failed to load event details');
    res.redirect('/events');
  }
});

// Guest Registration Prompt
router.get('/register', (req, res) => {
  res.redirect('/auth/register');
});

// Guest Login Prompt
router.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

module.exports = router;