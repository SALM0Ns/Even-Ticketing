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

// Generate fake taken seats (randomly select 20-40% of seats as taken)
function generateSeatingData(totalSeats) {
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

async function addShowDatesAndSeating() {
  try {
    console.log(' Adding show dates and seating data to all events...\n');

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movies = await Movie.find();
    for (const movie of movies) {
      const showDates = generateShowDates(movie.date);
      const totalSeats = movie.location.capacity || 200;
      const takenSeats = generateSeatingData(totalSeats);
      
      await Movie.updateOne(
        { _id: movie._id },
        { 
          $set: { 
            showDates: showDates,
            seating: {
              totalSeats: totalSeats,
              takenSeats: takenSeats,
              availableSeats: totalSeats - takenSeats.length
            }
          }
        }
      );
      console.log(`  ✅ ${movie.name}: ${showDates.length} shows, ${takenSeats.length}/${totalSeats} seats taken`);
    }

    // Update Stage Plays
    console.log('\n Updating Stage Plays...');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const showDates = generateShowDates(play.date);
      const totalSeats = play.location.capacity || 150;
      const takenSeats = generateSeatingData(totalSeats);
      
      await StagePlays.updateOne(
        { _id: play._id },
        { 
          $set: { 
            showDates: showDates,
            seating: {
              totalSeats: totalSeats,
              takenSeats: takenSeats,
              availableSeats: totalSeats - takenSeats.length
            }
          }
        }
      );
      console.log(`  ✅ ${play.name}: ${showDates.length} shows, ${takenSeats.length}/${totalSeats} seats taken`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const showDates = generateShowDates(concert.date);
      const totalSeats = concert.location.capacity || 100;
      const takenSeats = generateSeatingData(totalSeats);
      
      await LiveOrchestra.updateOne(
        { _id: concert._id },
        { 
          $set: { 
            showDates: showDates,
            seating: {
              totalSeats: totalSeats,
              takenSeats: takenSeats,
              availableSeats: totalSeats - takenSeats.length
            }
          }
        }
      );
      console.log(`  ✅ ${concert.name}: ${showDates.length} shows, ${takenSeats.length}/${totalSeats} seats taken`);
    }

    console.log('\n🎉 Show dates and seating data added successfully!');

  } catch (error) {
    console.error('❌ Error adding show dates and seating:', error);
  } finally {
    mongoose.connection.close();
  }
}

addShowDatesAndSeating();
