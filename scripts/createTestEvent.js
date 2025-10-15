const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Movie = require('../models/Movie');
const Location = require('../models/Location');
const User = require('../models/User');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Event'
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test event
const createTestEvent = async () => {
  try {
    console.log('🎬 Creating test event...');
    
    // Get organizer user
    const organizer = await User.findOne({ email: 'test@organizer.com' });
    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }
    console.log('👤 Found organizer:', organizer.name);
    
    // Get location
    const location = await Location.findOne({ name: 'AMC Lincoln Square' });
    if (!location) {
      console.log('❌ Location not found');
      return;
    }
    console.log('📍 Found location:', location.name);
    
    // Create event
    const event = new Movie({
      name: 'Test Movie 2024',
      description: 'This is a test movie event created directly in database.',
      image: '/images/default-event.jpg',
      date: new Date('2025-12-25T19:00:00'),
      endDate: new Date('2025-12-25T22:00:00'),
      location: {
        name: location.name,
        address: location.address,
        city: location.city,
        capacity: location.capacity
      },
      pricing: {
        basePrice: 15.99,
        vipPrice: 25.99,
        studentPrice: 12.99,
        seniorPrice: 10.99
      },
      organizer: organizer._id,
      status: 'upcoming',
      movieDetails: {
        director: 'Test Director',
        cast: 'Test Cast',
        duration: 120,
        rating: 'PG-13',
        releaseYear: 2024,
        language: 'English'
      }
    });
    
    await event.save();
    console.log('✅ Event created successfully:', event.name);
    console.log('📊 Event ID:', event._id);
    
  } catch (error) {
    console.error('❌ Error creating event:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run
const run = async () => {
  await connectDB();
  await createTestEvent();
};

run();
