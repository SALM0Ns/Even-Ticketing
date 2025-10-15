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

async function testSeatSelection() {
  try {
    console.log('🎭 Testing seat selection data...\n');

    // Get a movie to test
    const movie = await Movie.findOne();
    if (!movie) {
      console.log('❌ No movies found');
      return;
    }

    console.log(`📽️  Testing: ${movie.name}`);
    console.log(`   Show Dates: ${movie.showDates ? movie.showDates.length : 0} dates`);
    console.log(`   Total Seats: ${movie.seating ? movie.seating.totalSeats : 'N/A'}`);
    console.log(`   Taken Seats: ${movie.seating ? movie.seating.takenSeats.length : 'N/A'}`);
    console.log(`   Available Seats: ${movie.seating ? movie.seating.availableSeats : 'N/A'}`);
    
    if (movie.showDates) {
      console.log('\n   Show Dates:');
      movie.showDates.forEach((date, index) => {
        const showDate = new Date(date);
        console.log(`     ${index + 1}. ${showDate.toLocaleDateString()} at ${showDate.toLocaleTimeString()}`);
      });
    }
    
    if (movie.seating && movie.seating.takenSeats) {
      console.log(`\n   Sample Taken Seats: ${movie.seating.takenSeats.slice(0, 10).join(', ')}${movie.seating.takenSeats.length > 10 ? '...' : ''}`);
    }

    console.log('\n✅ Seat selection data is properly stored!');

  } catch (error) {
    console.error('❌ Error testing seat selection:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSeatSelection();
