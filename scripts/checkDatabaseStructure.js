const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Movie = require('../models/Movie');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME || 'Event'
});

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...\n');

    // Get a movie to check its structure
    const movie = await Movie.findOne();
    if (!movie) {
      console.log('❌ No movies found');
      return;
    }

    console.log(`📽️  Movie: ${movie.name}`);
    console.log('📋 Current fields:');
    console.log(JSON.stringify(movie.toObject(), null, 2));

  } catch (error) {
    console.error('❌ Error checking database structure:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabaseStructure();
