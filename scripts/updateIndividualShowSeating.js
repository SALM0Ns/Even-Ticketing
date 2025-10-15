const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Connect to MongoDB directly
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('Connected to MongoDB');
  updateIndividualShowSeating();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to generate random taken seats for each show
function generateRandomTakenSeats(totalSeats, takenPercentage = 0.3) {
  const numTakenSeats = Math.floor(totalSeats * takenPercentage);
  const takenSeats = [];
  
  // Generate unique random seat numbers
  while (takenSeats.length < numTakenSeats) {
    const seatNumber = Math.floor(Math.random() * totalSeats) + 1;
    if (!takenSeats.includes(seatNumber)) {
      takenSeats.push(seatNumber);
    }
  }
  
  return takenSeats.sort((a, b) => a - b);
}

// Function to generate show dates
function generateShowDates(baseDate, numShows = 5) {
  const showDates = [];
  const base = new Date(baseDate);
  
  for (let i = 0; i < numShows; i++) {
    const showDate = new Date(base);
    showDate.setDate(base.getDate() + i);
    showDate.setHours(19 + (i % 3), 0, 0, 0); // 7 PM, 8 PM, 9 PM rotation
    showDates.push(showDate);
  }
  
  return showDates;
}

async function updateIndividualShowSeating() {
  try {
    console.log('🎭 Updating individual show seating data...\n');

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movies = await Movie.find();
    for (const movie of movies) {
      const showDates = generateShowDates(movie.date, 5);
      const totalSeats = 270; // 15 rows × 18 seats per row
      
      // Create individual show seating data
      movie.showDates = showDates.map(showDate => ({
        date: showDate,
        seating: {
          totalSeats: totalSeats,
          takenSeats: generateRandomTakenSeats(totalSeats, 0.25 + Math.random() * 0.3), // 25-55% taken
          availableSeats: 0 // Will be calculated
        }
      }));
      
      // Calculate available seats for each show
      movie.showDates.forEach(show => {
        show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
      });
      
      await movie.save();
      console.log(`  ✅ ${movie.name}: ${movie.showDates.length} shows with individual seating`);
    }

    // Update Stage Plays
    console.log('\n🎭 Updating Stage Plays...');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const showDates = generateShowDates(play.date, 4);
      const totalSeats = 180; // Theater layout seats
      
      // Create individual show seating data
      play.showDates = showDates.map(showDate => ({
        date: showDate,
        seating: {
          totalSeats: totalSeats,
          takenSeats: generateRandomTakenSeats(totalSeats, 0.3 + Math.random() * 0.4), // 30-70% taken
          availableSeats: 0 // Will be calculated
        }
      }));
      
      // Calculate available seats for each show
      play.showDates.forEach(show => {
        show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
      });
      
      await play.save();
      console.log(`  ✅ ${play.name}: ${play.showDates.length} shows with individual seating`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const showDates = generateShowDates(concert.date, 3);
      const totalSeats = 180; // Theater layout seats
      
      // Create individual show seating data
      concert.showDates = showDates.map(showDate => ({
        date: showDate,
        seating: {
          totalSeats: totalSeats,
          takenSeats: generateRandomTakenSeats(totalSeats, 0.2 + Math.random() * 0.5), // 20-70% taken
          availableSeats: 0 // Will be calculated
        }
      }));
      
      // Calculate available seats for each show
      concert.showDates.forEach(show => {
        show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
      });
      
      await concert.save();
      console.log(`  ✅ ${concert.name}: ${concert.showDates.length} shows with individual seating`);
    }

    console.log('\n🎉 Individual show seating data updated successfully!');
    console.log('📊 Each show now has its own unique seating availability');

    // Verify the data
    console.log('\n🔍 Verifying data...');
    const testMovie = await Movie.findOne();
    if (testMovie && testMovie.showDates && testMovie.showDates.length > 0) {
      console.log(`✅ Verification: ${testMovie.name} has ${testMovie.showDates.length} shows`);
      testMovie.showDates.forEach((show, index) => {
        console.log(`   Show ${index + 1}: ${show.date.toLocaleString()} - ${show.seating.takenSeats.length}/${show.seating.totalSeats} seats taken`);
      });
    } else {
      console.log('❌ Verification failed - data not properly saved');
    }

  } catch (error) {
    console.error('❌ Error updating individual show seating:', error);
  } finally {
    mongoose.connection.close();
  }
}
