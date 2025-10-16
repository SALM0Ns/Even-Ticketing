const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/permissions');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// Admin Dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get statistics
    const totalMovies = await Movie.countDocuments();
    const totalStagePlays = await StagePlays.countDocuments();
    const totalOrchestra = await LiveOrchestra.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    
    // Get recent events
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(3);
    const recentStagePlays = await StagePlays.find().sort({ createdAt: -1 }).limit(3);
    const recentOrchestra = await LiveOrchestra.find().sort({ createdAt: -1 }).limit(3);
    
    const allRecentEvents = [...recentMovies, ...recentStagePlays, ...recentOrchestra]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - CursedTicket',
      stats: {
        totalMovies,
        totalStagePlays,
        totalOrchestra,
        totalUsers,
        totalTickets,
        totalEvents: totalMovies + totalStagePlays + totalOrchestra
      },
      recentEvents: allRecentEvents
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error', 'Failed to load admin dashboard');
    res.redirect('/');
  }
});

// Manage Events - List all events
router.get('/events', requireAdmin, async (req, res) => {
  try {
    const { category, status } = req.query;
    let events = [];

    // Get events based on category filter
    if (category === 'movies') {
      events = await Movie.find().sort({ createdAt: -1 });
      events = events.map(event => ({ ...event.toObject(), category: 'movies' }));
    } else if (category === 'stage-plays') {
      events = await StagePlays.find().sort({ createdAt: -1 });
      events = events.map(event => ({ ...event.toObject(), category: 'stage-plays' }));
    } else if (category === 'orchestra') {
      events = await LiveOrchestra.find().sort({ createdAt: -1 });
      events = events.map(event => ({ ...event.toObject(), category: 'orchestra' }));
    } else {
      // Get all events
      const movies = await Movie.find().sort({ createdAt: -1 });
      const stagePlays = await StagePlays.find().sort({ createdAt: -1 });
      const orchestra = await LiveOrchestra.find().sort({ createdAt: -1 });
      
      events = [
        ...movies.map(event => ({ ...event.toObject(), category: 'movies' })),
        ...stagePlays.map(event => ({ ...event.toObject(), category: 'stage-plays' })),
        ...orchestra.map(event => ({ ...event.toObject(), category: 'orchestra' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Filter by status if provided
    if (status) {
      events = events.filter(event => event.status === status);
    }

    // Get ticket counts for each event
    for (let event of events) {
      try {
        const tickets = await Ticket.find({ event: event._id });
        event.ticketsSold = tickets.length;
        event.ticketsLeft = (event.seating?.totalSeats || 0) - tickets.length;
      } catch (error) {
        event.ticketsSold = 0;
        event.ticketsLeft = event.seating?.totalSeats || 0;
      }
    }

    res.render('admin/events', {
      title: 'Manage Events - Admin',
      events,
      currentCategory: category || 'all',
      currentStatus: status || 'all'
    });
  } catch (error) {
    console.error('Admin events error:', error);
    req.flash('error', 'Failed to load events');
    res.redirect('/admin/dashboard');
  }
});

// View Event Details
router.get('/events/:category/:id', requireAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;
    let event = null;
    let model = null;

    // Determine which model to use
    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).render('404', { 
          title: 'Event Not Found',
          message: 'Invalid event category'
        });
    }

    event = await model.findById(id);
    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        message: 'Event not found'
      });
    }

    // Get ticket information
    const tickets = await Ticket.find({ event: event._id }).populate('user', 'name email');
    const ticketsSold = tickets.length;
    const ticketsLeft = (event.seating?.totalSeats || 0) - ticketsSold;

    res.render('admin/event-details', {
      title: `${event.name} - Admin`,
      event: { ...event.toObject(), category },
      tickets,
      ticketsSold,
      ticketsLeft
    });
  } catch (error) {
    console.error('Admin event details error:', error);
    req.flash('error', 'Failed to load event details');
    res.redirect('/admin/events');
  }
});

// Edit Event Form
router.get('/events/:category/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;
    let event = null;
    let model = null;

    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).render('404', { 
          title: 'Event Not Found',
          message: 'Invalid event category'
        });
    }

    event = await model.findById(id);
    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        message: 'Event not found'
      });
    }

    res.render('admin/edit-event', {
      title: `Edit ${event.name} - Admin`,
      event: { ...event.toObject(), category }
    });
  } catch (error) {
    console.error('Admin edit event error:', error);
    req.flash('error', 'Failed to load event for editing');
    res.redirect('/admin/events');
  }
});

// Update Event
router.post('/events/:category/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;
    const updateData = req.body;
    let model = null;

    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).render('404', { 
          title: 'Event Not Found',
          message: 'Invalid event category'
        });
    }

    const event = await model.findByIdAndUpdate(id, updateData, { new: true });
    if (!event) {
      return res.status(404).render('404', { 
        title: 'Event Not Found',
        message: 'Event not found'
      });
    }

    req.flash('success', 'Event updated successfully');
    res.redirect(`/admin/events/${category}/${id}`);
  } catch (error) {
    console.error('Admin update event error:', error);
    req.flash('error', 'Failed to update event');
    res.redirect(`/admin/events/${category}/${id}/edit`);
  }
});

// Get Event Details for Delete Modal
router.get('/events/:category/:id/details', requireAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;
    let model = null;

    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).json({ success: false, message: 'Invalid event category' });
    }

    const event = await model.findById(id).populate('organizer', 'name email').populate('location', 'name');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get ticket information
    const tickets = await Ticket.find({ event: id });
    const ticketsSold = tickets.length;
    const ticketsLeft = (event.seating?.totalSeats || 0) - ticketsSold;

    res.json({ 
      success: true, 
      event: {
        ...event.toObject(),
        ticketsSold,
        ticketsLeft
      }
    });
  } catch (error) {
    console.error('Admin event details error:', error);
    res.status(500).json({ success: false, message: 'Failed to load event details' });
  }
});

// Delete Event with Refunds
router.post('/events/:category/:id/delete', requireAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;
    let model = null;

    switch (category) {
      case 'movies':
        model = Movie;
        break;
      case 'stage-plays':
        model = StagePlays;
        break;
      case 'orchestra':
        model = LiveOrchestra;
        break;
      default:
        return res.status(404).json({ success: false, message: 'Invalid event category' });
    }

    const event = await model.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get all tickets for this event
    const tickets = await Ticket.find({ event: id }).populate('user', 'name email');
    
    if (tickets.length > 0) {
      // Mark all tickets as cancelled
      await Ticket.updateMany(
        { event: id },
        { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Event deleted by admin'
        }
      );

      // Process refunds (in a real app, you'd integrate with payment gateway)
      const refunds = [];
      for (const ticket of tickets) {
        refunds.push({
          ticketId: ticket._id,
          userId: ticket.user._id,
          userEmail: ticket.user.email,
          userName: ticket.user.name,
          amount: event.price || 0,
          refundedAt: new Date(),
          status: 'processed' // In real app, this would be 'pending' until payment gateway confirms
        });
      }

      // Log refunds (in a real app, you'd save to a refunds collection)
      console.log('Refunds processed:', refunds);

      // TODO: Send email notifications to customers
      // TODO: Send email notification to organizer
    }

    // Delete the event
    await model.findByIdAndDelete(id);

    const message = tickets.length > 0 
      ? `Event deleted successfully. ${tickets.length} tickets cancelled and refunds processed.`
      : 'Event deleted successfully.';

    res.json({ success: true, message });
  } catch (error) {
    console.error('Admin delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// Manage Users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    
    // Get user statistics
    const userStats = {
      total: await User.countDocuments(),
      attendees: await User.countDocuments({ role: 'attendee' }),
      organizers: await User.countDocuments({ role: 'organizer' }),
      admins: await User.countDocuments({ role: 'admin' })
    };

    res.render('admin/users', {
      title: 'Manage Users - Admin',
      users,
      userStats,
      currentRole: role || 'all',
      searchQuery: search || ''
    });
  } catch (error) {
    console.error('Admin users error:', error);
    req.flash('error', 'Failed to load users');
    res.redirect('/admin/dashboard');
  }
});

// Update User Role
router.post('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['attendee', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// Delete User
router.post('/users/:id/delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has tickets
    const tickets = await Ticket.find({ user: id });
    if (tickets.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete user with existing tickets. Please contact support.' 
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
