const express = require('express');
const router = express.Router();
const { requireAttendee } = require('../middleware/permissions');

// Middleware to ensure user is an attendee
router.use(requireAttendee);

// Attendee Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    res.render('attendee/dashboard', {
      title: 'Attendee Dashboard - CursedTicket',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error rendering attendee dashboard:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
});

// My Tickets Page
router.get('/tickets', async (req, res) => {
  try {
    res.render('my-tickets', {
      title: 'My Tickets - CursedTicket',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error rendering my tickets:', error);
    req.flash('error', 'Failed to load tickets');
    res.redirect('/attendee/dashboard');
  }
});

// Purchase Ticket Page
router.get('/buy/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details based on event type
    let event = null;
    let eventType = null;
    
    // Try to find event in different collections
    const Movie = require('../models/Movie');
    const StagePlays = require('../models/StagePlays');
    const LiveOrchestra = require('../models/LiveOrchestra');
    
    event = await Movie.findById(eventId);
    if (event) {
      eventType = 'movies';
    } else {
      event = await StagePlays.findById(eventId);
      if (event) {
        eventType = 'stage-plays';
      } else {
        event = await LiveOrchestra.findById(eventId);
        if (event) {
          eventType = 'orchestra';
        }
      }
    }
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    res.render('events/show', {
      title: `${event.name} - CursedTicket`,
      event: event,
      eventType: eventType,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error loading purchase page:', error);
    req.flash('error', 'Failed to load event details');
    res.redirect('/events');
  }
});

// Bookmark Event
router.post('/bookmark/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.session.user.id;
    
    // This would typically involve a UserBookmark model
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Event bookmarked successfully'
    });
  } catch (error) {
    console.error('Error bookmarking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark event'
    });
  }
});

// Remove Bookmark
router.delete('/bookmark/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.session.user.id;
    
    // This would typically involve removing from UserBookmark model
    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark'
    });
  }
});

// Get User's Bookmarked Events
router.get('/bookmarks', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // This would typically fetch from UserBookmark model
    // For now, return empty array
    res.json({
      success: true,
      bookmarks: []
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks'
    });
  }
});

module.exports = router;