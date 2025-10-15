const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
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
  res.locals.user = req.session ? req.session.user : null;
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
    // Get featured events from all categories
    const featuredMovies = await Movie.find().limit(3);
    const featuredPlays = await StagePlays.find().limit(3);
    const featuredOrchestra = await LiveOrchestra.find().limit(3);
    
    // Combine and shuffle featured events
    const allFeatured = [...featuredMovies, ...featuredPlays, ...featuredOrchestra];
    const shuffledFeatured = allFeatured.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    res.render('index', { 
      title: 'CursedTicket - Premium Entertainment',
      user: req.session ? req.session.user : null,
      featuredEvents: shuffledFeatured
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.render('index', { 
      title: 'CursedTicket - Premium Entertainment',
      user: req.session ? req.session.user : null,
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
    const featuredMovies = await Movie.find().limit(2);
    const featuredPlays = await StagePlays.find().limit(2);
    const featuredOrchestra = await LiveOrchestra.find().limit(2);
    
    const allFeatured = [...featuredMovies, ...featuredPlays, ...featuredOrchestra];
    const shuffledFeatured = allFeatured.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    res.json({ events: shuffledFeatured });
  } catch (error) {
    console.error('Error loading featured events:', error);
    res.status(500).json({ error: 'Failed to load featured events' });
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
    const playsWithCategory = stagePlays.map(play => ({
      ...play.toObject(),
      category: 'stage-plays'
    }));
    res.json({ events: playsWithCategory });
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
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');

// Use routes
app.use('/events', eventRoutes);
// app.use('/auth', authRoutes);
// app.use('/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    user: req.session ? req.session.user : null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { 
    title: 'Server Error',
    user: req.session ? req.session.user : null,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});
