const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import models
const Location = require('./models/Location');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/Event',
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: false, // set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Flash messages
app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables for templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
});

// Import models
const Movie = require('./models/Movie');
const StagePlays = require('./models/StagePlays');
const LiveOrchestra = require('./models/LiveOrchestra');

// Import date mocking utility
const dateMock = require('./utils/dateMock');

// Routes
app.get('/', async (req, res) => {
  try {
    // Get all events for featured section
    const featuredMovies = await Movie.find().populate('organizer', 'name');
    const featuredPlays = await StagePlays.find().populate('organizer', 'name');
    const featuredOrchestra = await LiveOrchestra.find().populate('organizer', 'name');
    
    // Combine and sort featured events by date, then limit to 6
    const allFeatured = [
      ...featuredMovies.map(movie => ({ ...movie.toObject(), category: 'movies' })),
      ...featuredPlays.map(play => ({ ...play.toObject(), category: 'stage-plays' })),
      ...featuredOrchestra.map(concert => ({ ...concert.toObject(), category: 'orchestra' }))
    ];
    const sortedFeatured = allFeatured.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
    
    res.render('index', { 
      title: 'CursedTicket - Premium Entertainment',
      user: req.session.user,
      featuredEvents: sortedFeatured
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.render('index', { 
      title: 'CursedTicket - Premium Entertainment',
      user: req.session.user,
      featuredEvents: []
    });
  }
});

// API Routes for statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const movieStats = await Movie.getMovieStats();
    const playStats = await StagePlays.getStagePlayStats();
    const orchestraStats = await LiveOrchestra.getOrchestraStats();
    
    res.json({
      totalEvents: movieStats.totalMovies + playStats.totalPlays + orchestraStats.totalConcerts,
      totalTickets: movieStats.totalSeats + playStats.totalSeats + orchestraStats.totalSeats,
      totalUsers: 0, // Will be implemented with User model
      totalOrganizers: 0, // Will be implemented with User model
      movies: movieStats,
      stagePlays: playStats,
      orchestra: orchestraStats
    });
  } catch (error) {
    console.error('Error loading statistics:', error);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

// API Routes for featured events
app.get('/api/events/featured', async (req, res) => {
  try {
    // Get all events regardless of status for featured section
    const featuredMovies = await Movie.find().populate('organizer', 'name');
    const featuredPlays = await StagePlays.find().populate('organizer', 'name');
    const featuredOrchestra = await LiveOrchestra.find().populate('organizer', 'name');
    
    const allFeatured = [
      ...featuredMovies.map(movie => ({ ...movie.toObject(), category: 'movies' })),
      ...featuredPlays.map(play => ({ ...play.toObject(), category: 'stage-plays' })),
      ...featuredOrchestra.map(concert => ({ ...concert.toObject(), category: 'orchestra' }))
    ];
    const sortedFeatured = allFeatured.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
    
    res.json({ events: sortedFeatured });
  } catch (error) {
    console.error('Error loading featured events:', error);
    res.status(500).json({ error: 'Failed to load featured events' });
  }
});

// API Route for locations
app.get('/api/locations', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    // Filter by venue type based on event category
    if (category === 'movies') {
      query.venueType = 'cinema';
    } else if (category === 'stage-plays') {
      query.venueType = 'theater';
    } else if (category === 'orchestra') {
      query.venueType = 'concert_hall';
    }
    
    const locations = await Location.find(query).sort({ name: 1 });
    res.json({ locations });
  } catch (error) {
    console.error('Error loading locations:', error);
    res.status(500).json({ error: 'Failed to load locations' });
  }
});

// Movies API
app.get('/api/events/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ date: 1 });
    const moviesWithCategory = movies.map(movie => ({
      ...movie.toObject(),
      category: 'movies'
    }));
    res.json({ events: moviesWithCategory });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Stage Plays API
app.get('/api/events/stage-plays', async (req, res) => {
  try {
    const stagePlays = await StagePlays.find().sort({ date: 1 });
    const stagePlaysWithCategory = stagePlays.map(play => ({
      ...play.toObject(),
      category: 'stage-plays'
    }));
    res.json({ events: stagePlaysWithCategory });
  } catch (error) {
    console.error('Error fetching stage plays:', error);
    res.status(500).json({ error: 'Failed to fetch stage plays' });
  }
});

// Orchestra API
app.get('/api/events/orchestra', async (req, res) => {
  try {
    const orchestra = await LiveOrchestra.find().sort({ date: 1 });
    const orchestraWithCategory = orchestra.map(concert => ({
      ...concert.toObject(),
      category: 'orchestra'
    }));
    res.json({ events: orchestraWithCategory });
  } catch (error) {
    console.error('Error fetching orchestra events:', error);
    res.status(500).json({ error: 'Failed to fetch orchestra events' });
  }
});

// Coming Soon API (events starting in the next 30 days) - Using date mocking
app.get('/api/events/coming-soon', async (req, res) => {
  try {
    const mockCurrentDate = dateMock.getCurrentDate();
    const thirtyDaysFromNow = dateMock.getDateFromNow(30);
    
    const movies = await Movie.find({ date: { $gte: mockCurrentDate, $lte: thirtyDaysFromNow } });
    const stagePlays = await StagePlays.find({ date: { $gte: mockCurrentDate, $lte: thirtyDaysFromNow } });
    const orchestra = await LiveOrchestra.find({ date: { $gte: mockCurrentDate, $lte: thirtyDaysFromNow } });
    
    const comingSoonEvents = [
      ...movies.map(movie => ({ ...movie.toObject(), category: 'movies' })),
      ...stagePlays.map(play => ({ ...play.toObject(), category: 'stage-plays' })),
      ...orchestra.map(concert => ({ ...concert.toObject(), category: 'orchestra' }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({ events: comingSoonEvents });
  } catch (error) {
    console.error('Error fetching coming soon events:', error);
    res.status(500).json({ error: 'Failed to fetch coming soon events' });
  }
});

// Starting Soon API (events starting in the next 7 days) - Using date mocking
app.get('/api/events/starting-soon', async (req, res) => {
  try {
    const mockCurrentDate = dateMock.getCurrentDate();
    const sevenDaysFromNow = dateMock.getDateFromNow(7);
    
    const movies = await Movie.find({ date: { $gte: mockCurrentDate, $lte: sevenDaysFromNow } });
    const stagePlays = await StagePlays.find({ date: { $gte: mockCurrentDate, $lte: sevenDaysFromNow } });
    const orchestra = await LiveOrchestra.find({ date: { $gte: mockCurrentDate, $lte: sevenDaysFromNow } });
    
    const startingSoonEvents = [
      ...movies.map(movie => ({ ...movie.toObject(), category: 'movies' })),
      ...stagePlays.map(play => ({ ...play.toObject(), category: 'stage-plays' })),
      ...orchestra.map(concert => ({ ...concert.toObject(), category: 'orchestra' }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({ events: startingSoonEvents });
  } catch (error) {
    console.error('Error fetching starting soon events:', error);
    res.status(500).json({ error: 'Failed to fetch starting soon events' });
  }
});

// Import routes
const eventRoutes = require('./routes/events');
const { router: authRoutes, requireAuth, requireRole } = require('./routes/auth');
const attendeeRoutes = require('./routes/attendee');
const organizerRoutes = require('./routes/organizer');
const guestRoutes = require('./routes/guest');

// Use routes
app.use('/events', eventRoutes);
app.use('/auth', authRoutes);
app.use('/attendee', attendeeRoutes);
app.use('/organizer', organizerRoutes);
app.use('/guest', guestRoutes);

// Profile route
app.get('/profile', requireAuth, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }
    
    res.render('auth/profile', {
      title: 'Profile - CursedTicket',
      user: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    req.flash('error', 'Failed to load profile');
    res.redirect('/');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    user: req.session.user 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { 
    title: 'Server Error',
    user: req.session.user,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});
