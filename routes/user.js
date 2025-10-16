const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserTicket = require('../models/UserTicket');
const Order = require('../models/Order');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Update user profile
router.put('/update-profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update session
    req.session.user.name = updatedUser.name;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/statistics', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userEmail = req.session.user.email;

    // Get total tickets purchased
    const userTickets = await UserTicket.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    });

    // Calculate statistics
    const totalTickets = userTickets.reduce((sum, ticket) => sum + ticket.tickets.length, 0);
    const totalSpent = userTickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);
    
    // Count upcoming events (events with showDate in the future)
    const now = new Date();
    const upcomingEvents = userTickets.filter(ticket => 
      new Date(ticket.event.showDate) > now && ticket.status === 'active'
    ).length;

    res.json({
      success: true,
      statistics: {
        totalTickets,
        totalSpent,
        upcomingEvents,
        totalOrders: userTickets.length
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get recent activity
router.get('/recent-activity', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userEmail = req.session.user.email;

    // Get recent tickets
    const recentTickets = await UserTicket.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    // Format activities
    const activities = recentTickets.map(ticket => {
      const showDate = new Date(ticket.event.showDate);
      const isUpcoming = showDate > new Date();
      
      return {
        title: `Purchased ticket for ${ticket.event.eventName}`,
        description: `Seat: ${ticket.tickets.map(t => t.seatNumber).join(', ')} • ${ticket.event.venue.name}`,
        date: ticket.createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        icon: isUpcoming ? 'ticket-alt' : 'check-circle',
        color: isUpcoming ? 'primary' : 'success'
      };
    });

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

module.exports = router;
