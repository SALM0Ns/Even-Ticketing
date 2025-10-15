const express = require('express');
const multer = require('multer');

const router = express.Router();
const { requireOrganizer } = require('../middleware/permissions');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
const Ticket = require('../models/Ticket');
const cloudinary = require('../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const parsePricingFields = (body) => {
  const read = (key) => body[`pricing[${key}]`] ?? body?.pricing?.[key];
  const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    basePrice: toNumber(read('basePrice')),
    vipPrice: toNumber(read('vipPrice')),
    studentPrice: toNumber(read('studentPrice')),
    seniorPrice: toNumber(read('seniorPrice'))
  };
};

const saveEventImage = async (file) => {
  if (!file) {
    return null;
  }

  if (!file.mimetype?.startsWith('image/')) {
    throw new Error('Invalid image type');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials not configured. Falling back to default image.');
    return null;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'cursedticket/events',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// GET /organizer/dashboard - View dashboard with ticket buyers list (Organizer only)
router.get('/dashboard', requireOrganizer, async (req, res) => {
  try {
    const organizerId = req.session.user.id;
    
    // Get organizer's events
    const movies = await Movie.find({ organizer: organizerId });
    const stagePlays = await StagePlays.find({ organizer: organizerId });
    const orchestra = await LiveOrchestra.find({ organizer: organizerId });
    
    const allEvents = [...movies, ...stagePlays, ...orchestra];
    
    // Get tickets for all events
    const eventIds = allEvents.map(event => event._id);
    const tickets = await Ticket.getTicketsForEvents(eventIds);
    
    // Calculate statistics
    const totalEvents = allEvents.length;
    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
    
    // Group tickets by event
    const ticketsByEvent = {};
    tickets.forEach(ticket => {
      const eventDoc = ticket.event;
      if (!eventDoc || !eventDoc._id) {
        return;
      }
      const eventId = eventDoc._id.toString();
      if (!ticketsByEvent[eventId]) {
        ticketsByEvent[eventId] = {
          event: eventDoc,
          tickets: []
        };
      }
      ticketsByEvent[eventId].tickets.push(ticket);
    });
    
    res.render('organizer/dashboard', {
      title: 'Organizer Dashboard - CursedTicket',
      events: allEvents,
      tickets: tickets,
      ticketsByEvent: ticketsByEvent,
      stats: {
        totalEvents,
        totalTicketsSold,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
});

// GET /organizer/events - View own events list (Organizer only)
router.get('/events', requireOrganizer, async (req, res) => {
  try {
    const organizerId = req.session.user.id;
    
    const movies = await Movie.find({ organizer: organizerId });
    const stagePlays = await StagePlays.find({ organizer: organizerId });
    const orchestra = await LiveOrchestra.find({ organizer: organizerId });
    
    const allEvents = [...movies, ...stagePlays, ...orchestra]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.render('organizer/events', {
      title: 'My Events - CursedTicket',
      events: allEvents
    });
  } catch (error) {
    console.error('Events error:', error);
    req.flash('error', 'Failed to load events');
    res.redirect('/organizer/dashboard');
  }
});

// GET /organizer/events/create - Create new event form (Organizer only)
router.get('/events/create', requireOrganizer, (req, res) => {
  res.render('organizer/create-event', {
    title: 'Create Event - CursedTicket'
  });
});

// POST /organizer/events/create - Process new event creation
router.post('/events/create', requireOrganizer, upload.single('image'), async (req, res) => {
  try {
    // Debug logs removed for production
    
    const {
      name,
      description,
      category,
      date,
      endDate,
      locationId
    } = req.body;

    const pricing = parsePricingFields(req.body);
    
    // Try both _id and id fields
    const organizerId = req.session.user?._id || req.session.user?.id;
    
    if (!organizerId) {
      req.flash('error', 'User session expired. Please login again.');
      return res.redirect('/auth/login');
    }
    
    // Get location data
    let locationData;
    if (!locationId) {
      req.flash('error', 'Please select a venue');
      return res.redirect('/organizer/events/create');
    }
    
    // Use existing location from database
    const Location = require('../models/Location');
    const existingLocation = await Location.findById(locationId);
    if (!existingLocation) {
      req.flash('error', 'Selected location not found');
      return res.redirect('/organizer/events/create');
    }
    
    const capacityInput = req.body.locationCapacity ?? req.body.location?.capacity;
    const parsedCapacity = Number(capacityInput);
    const normalizedCapacity = Number.isFinite(parsedCapacity) && parsedCapacity > 0
      ? Math.floor(parsedCapacity)
      : existingLocation.capacity;

    locationData = {
      name: existingLocation.name,
      address: existingLocation.address,
      city: existingLocation.city,
      capacity: normalizedCapacity
    };
    
    // Create event based on category
    let event;
    let eventImage = '/images/default-event.jpg';
    try {
      const savedImage = await saveEventImage(req.file);
      if (savedImage) {
        eventImage = savedImage;
      }
    } catch (imageError) {
      console.error('Event image upload error:', imageError);
      req.flash('error', 'Image upload failed. Please use a valid image file under 5MB.');
      return res.redirect('/organizer/events/create');
    }

    if (pricing.basePrice === null) {
      req.flash('error', 'Base price is required.');
      return res.redirect('/organizer/events/create');
    }

    const eventData = {
      name,
      description,
      image: eventImage,
      date: new Date(date),
      endDate: new Date(endDate),
      location: locationData,
      pricing: {
        basePrice: pricing.basePrice,
        vipPrice: pricing.vipPrice,
        studentPrice: pricing.studentPrice,
        seniorPrice: pricing.seniorPrice
      },
      organizer: organizerId,
      status: 'upcoming'
    };
    
    if (category === 'movies') {
      event = new Movie({
        ...eventData,
        movieDetails: {
          director: 'TBD',
          cast: 'TBD',
          duration: 120,
          rating: 'PG-13',
          releaseYear: new Date().getFullYear(),
          language: 'English'
        }
      });
    } else if (category === 'stage-plays') {
      event = new StagePlays({
        ...eventData,
        stagePlayDetails: {
          director: 'TBD',
          cast: 'TBD',
          duration: 150,
          intermission: true
        }
      });
    } else if (category === 'orchestra') {
      event = new LiveOrchestra({
        ...eventData,
        orchestraDetails: {
          conductor: 'TBD',
          program: 'TBD',
          duration: 90,
          intermission: true
        }
      });
    }
    
    if (!event) {
      req.flash('error', 'Invalid event category selected.');
      return res.redirect('/organizer/events/create');
    }
    
    await event.save();
    
    req.flash('success', 'Event created successfully');
    res.redirect('/organizer/events');
  } catch (error) {
    console.error('Create event error:', error);
    req.flash('error', 'Failed to create event');
    res.redirect('/organizer/events/create');
  }
});

// GET /organizer/events/:id/edit - Edit own event (Organizer only)
router.get('/events/:id/edit', requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.session.user.id;
    
    // Find event in all categories
    let event = await Movie.findOne({ _id: id, organizer: organizerId });
    let eventType = 'movies';
    
    if (!event) {
      event = await StagePlays.findOne({ _id: id, organizer: organizerId });
      eventType = 'stage-plays';
    }
    
    if (!event) {
      event = await LiveOrchestra.findOne({ _id: id, organizer: organizerId });
      eventType = 'orchestra';
    }
    
    if (!event) {
      req.flash('error', 'Event not found or you do not have permission to edit it');
      return res.redirect('/organizer/events');
    }
    
    res.render('organizer/edit-event', {
      title: `Edit ${event.name} - CursedTicket`,
      event: event,
      eventType: eventType
    });
  } catch (error) {
    console.error('Edit event error:', error);
    req.flash('error', 'Failed to load event');
    res.redirect('/organizer/events');
  }
});

// POST /organizer/events/:id/edit - Process event update
router.post('/events/:id/edit', requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.session.user.id;
    
    // Find and update event
    let event = await Movie.findOne({ _id: id, organizer: organizerId });
    if (!event) {
      event = await StagePlays.findOne({ _id: id, organizer: organizerId });
    }
    if (!event) {
      event = await LiveOrchestra.findOne({ _id: id, organizer: organizerId });
    }
    
    if (!event) {
      req.flash('error', 'Event not found or you do not have permission to edit it');
      return res.redirect('/organizer/events');
    }
    
    // Update event fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          if (!event[parent]) event[parent] = {};
          event[parent][child] = req.body[key];
        } else {
          event[key] = req.body[key];
        }
      }
    });
    
    await event.save();
    
    req.flash('success', 'Event updated successfully');
    res.redirect('/organizer/events');
  } catch (error) {
    console.error('Update event error:', error);
    req.flash('error', 'Failed to update event');
    res.redirect(`/organizer/events/${req.params.id}/edit`);
  }
});

// POST /organizer/events/:id/delete - Delete own event (Organizer only)
router.post('/events/:id/delete', requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.session.user.id;
    
    // Find and delete event
    let event = await Movie.findOne({ _id: id, organizer: organizerId });
    if (!event) {
      event = await StagePlays.findOne({ _id: id, organizer: organizerId });
    }
    if (!event) {
      event = await LiveOrchestra.findOne({ _id: id, organizer: organizerId });
    }
    
    if (!event) {
      req.flash('error', 'Event not found or you do not have permission to delete it');
      return res.redirect('/organizer/events');
    }
    
    // Delete associated tickets
    await Ticket.deleteMany({ event: id });
    
    // Delete event
    await event.deleteOne();
    
    req.flash('success', 'Event deleted successfully');
    res.redirect('/organizer/events');
  } catch (error) {
    console.error('Delete event error:', error);
    req.flash('error', 'Failed to delete event');
    res.redirect('/organizer/events');
  }
});

module.exports = router;
