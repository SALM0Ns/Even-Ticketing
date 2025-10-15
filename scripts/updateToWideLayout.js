const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME || 'Event'
});

// Generate fake taken seats for wide layout (20 seats per row)
function generateWideSeatingData(totalSeats) {
  const takenPercentage = 0.2 + Math.random() * 0.2; // 20-40% taken
  const takenCount = Math.floor(totalSeats * takenPercentage);
  const takenSeats = [];
  
  // Generate random seat numbers
  for (let i = 0; i < takenCount; i++) {
    let seatNumber;
    do {
      seatNumber = Math.floor(Math.random() * totalSeats) + 1;
    } while (takenSeats.includes(seatNumber));
    takenSeats.push(seatNumber);
  }
  
  return takenSeats.sort((a, b) => a - b);
}

// Generate show dates (3-5 shows over the next week)
function generateShowDates(baseDate) {
  const showDates = [];
  const base = new Date(baseDate);
  
  // Add the original date
  showDates.push(new Date(base));
  
  // Add 2-4 additional dates
  const additionalShows = 2 + Math.floor(Math.random() * 3);
  for (let i = 1; i <= additionalShows; i++) {
    const newDate = new Date(base);
    newDate.setDate(base.getDate() + i);
    newDate.setHours(14 + Math.floor(Math.random() * 6), Math.random() < 0.5 ? 0 : 30, 0, 0); // Random time between 2-8 PM
    showDates.push(newDate);
  }
  
  return showDates.sort((a, b) => a - b);
}

async function updateToWideLayout() {
  try {
    console.log(' Updating to wide cinema layout (20 seats per row)...\n');

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movies = await Movie.find();
    for (const movie of movies) {
      const showDates = generateShowDates(movie.date);
      const totalSeats = 300; // 15 rows × 20 seats per row
      const takenSeats = generateWideSeatingData(totalSeats);
      
      // Add the new fields
      movie.showDates = showDates;
      movie.seating = {
        totalSeats: totalSeats,
        takenSeats: takenSeats,
        availableSeats: totalSeats - takenSeats.length
      };
      
      await movie.save();
      console.log(`  ✅ ${movie.name}: ${movie.showDates.length} shows, ${movie.seating.takenSeats.length}/${movie.seating.totalSeats} seats taken`);
    }

    // Update Stage Plays
    console.log('\n Updating Stage Plays...');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const showDates = generateShowDates(play.date);
      const totalSeats = 240; // 12 rows × 20 seats per row
      const takenSeats = generateWideSeatingData(totalSeats);
      
      // Add the new fields
      play.showDates = showDates;
      play.seating = {
        totalSeats: totalSeats,
        takenSeats: takenSeats,
        availableSeats: totalSeats - takenSeats.length
      };
      
      await play.save();
      console.log(`  ✅ ${play.name}: ${play.showDates.length} shows, ${play.seating.takenSeats.length}/${play.seating.totalSeats} seats taken`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const showDates = generateShowDates(concert.date);
      const totalSeats = 200; // 10 rows × 20 seats per row
      const takenSeats = generateWideSeatingData(totalSeats);
      
      // Add the new fields
      concert.showDates = showDates;
      concert.seating = {
        totalSeats: totalSeats,
        takenSeats: takenSeats,
        availableSeats: totalSeats - takenSeats.length
      };
      
      await concert.save();
      console.log(`  ✅ ${concert.name}: ${concert.showDates.length} shows, ${concert.seating.takenSeats.length}/${concert.seating.totalSeats} seats taken`);
    }

    console.log('\n🎉 Wide cinema layout updated successfully!');
    console.log('📊 Layout: 20 seats per row (6 left + 4 center + 6 right + 4 far right)');

    // Verify the data
    console.log('\n🔍 Verifying data...');
    const testMovie = await Movie.findOne();
    if (testMovie && testMovie.showDates && testMovie.seating) {
      console.log(`✅ Verification: ${testMovie.name} has ${testMovie.showDates.length} show dates and ${testMovie.seating.totalSeats} total seats`);
      console.log(`   Layout: ${Math.ceil(testMovie.seating.totalSeats / 20)} rows × 20 seats per row`);
    } else {
      console.log('❌ Verification failed - data not properly saved');
    }

  } catch (error) {
    console.error('❌ Error updating to wide layout:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateToWideLayout();
