const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📅 Adding Show Dates to All Events...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return addShowDates();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function addShowDates() {
  try {
    // Generate show dates for the next 7 days
    const baseDate = new Date();
    baseDate.setHours(19, 0, 0, 0); // 7:00 PM
    
    const showDates = [];
    for (let i = 0; i < 7; i++) {
      const showDate = new Date(baseDate);
      showDate.setDate(baseDate.getDate() + i);
      
      showDates.push({
        date: showDate,
        seating: {
          totalSeats: 198, // 11 rows × 18 seats
          takenSeats: generateRandomTakenSeats(198, 0.3), // 30% taken
          availableSeats: 0 // Will be calculated
        }
      });
    }

    // Update available seats
    showDates.forEach(show => {
      show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
    });

    console.log('📽️  Adding show dates to Movies...');
    const movies = await Movie.find({});
    for (const movie of movies) {
      await Movie.findByIdAndUpdate(movie._id, { showDates: showDates });
      console.log(`   ✅ ${movie.name}: Added ${showDates.length} show dates`);
    }

    console.log('\n Adding show dates to Stage Plays...');
    const stagePlays = await StagePlays.find({});
    for (const play of stagePlays) {
      await StagePlays.findByIdAndUpdate(play._id, { showDates: showDates });
      console.log(`   ✅ ${play.name}: Added ${showDates.length} show dates`);
    }

    console.log('\n🎼 Adding show dates to Live Orchestra...');
    const orchestraEvents = await LiveOrchestra.find({});
    for (const concert of orchestraEvents) {
      await LiveOrchestra.findByIdAndUpdate(concert._id, { showDates: showDates });
      console.log(`   ✅ ${concert.name}: Added ${showDates.length} show dates`);
    }

    console.log('\n🎉 All events updated with show dates!');
    console.log(`📅 Each event now has ${showDates.length} show dates`);
    console.log('🕐 Show times: 7:00 PM daily for next 7 days');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

function generateRandomTakenSeats(totalSeats, percentage) {
  const takenCount = Math.floor(totalSeats * percentage);
  const takenSeats = [];
  
  for (let i = 0; i < takenCount; i++) {
    let seatNumber;
    do {
      seatNumber = Math.floor(Math.random() * totalSeats) + 1;
    } while (takenSeats.includes(seatNumber));
    
    takenSeats.push(seatNumber);
  }
  
  return takenSeats.sort((a, b) => a - b);
}
