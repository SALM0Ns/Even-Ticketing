const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📅 Updating Event Dates - Extended Timeline...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return updateEventDates();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function updateEventDates() {
  try {
    // Generate random dates 1-2 weeks from now
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 7); // Start from 1 week from now
    
    // Update Movies
    console.log('📽️  Updating Movie dates...');
    const movies = await Movie.find({});
    for (const movie of movies) {
      // Random date between 1-2 weeks from now
      const randomDays = Math.floor(Math.random() * 14) + 7; // 7-21 days
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + randomDays);
      newDate.setHours(19, 0, 0, 0); // 7:00 PM
      
      await Movie.findByIdAndUpdate(movie._id, { 
        date: newDate,
        showDates: generateShowDates(newDate)
      });
      
      console.log(`   ✅ ${movie.name}: ${newDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
    }

    // Update Stage Plays
    console.log('\n🎭 Updating Stage Play dates...');
    const stagePlays = await StagePlays.find({});
    for (const play of stagePlays) {
      // Random date between 1-2 weeks from now
      const randomDays = Math.floor(Math.random() * 14) + 7; // 7-21 days
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + randomDays);
      newDate.setHours(19, 30, 0, 0); // 7:30 PM for stage plays
      
      await StagePlays.findByIdAndUpdate(play._id, { 
        date: newDate,
        showDates: generateShowDates(newDate, 19, 30)
      });
      
      console.log(`   ✅ ${play.name}: ${newDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra dates...');
    const orchestraEvents = await LiveOrchestra.find({});
    for (const concert of orchestraEvents) {
      // Random date between 1-2 weeks from now
      const randomDays = Math.floor(Math.random() * 14) + 7; // 7-21 days
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + randomDays);
      newDate.setHours(20, 0, 0, 0); // 8:00 PM for concerts
      
      await LiveOrchestra.findByIdAndUpdate(concert._id, { 
        date: newDate,
        showDates: generateShowDates(newDate, 20, 0)
      });
      
      console.log(`   ✅ ${concert.name}: ${newDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
    }

    console.log('\n🎉 All event dates updated successfully!');
    console.log('⏰ Countdown Timer will now show active countdowns');
    console.log('📅 Events are scheduled 1-2 weeks from now');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

function generateShowDates(baseDate, hour = 19, minute = 0) {
  const showDates = [];
  
  // Generate 7 show dates starting from base date
  for (let i = 0; i < 7; i++) {
    const showDate = new Date(baseDate);
    showDate.setDate(baseDate.getDate() + i);
    showDate.setHours(hour, minute, 0, 0);
    
    showDates.push({
      date: showDate,
      seating: {
        totalSeats: 198, // 11 rows × 18 seats
        takenSeats: generateRandomTakenSeats(198, 0.2 + Math.random() * 0.3), // 20-50% taken
        availableSeats: 0 // Will be calculated
      }
    });
  }

  // Update available seats
  showDates.forEach(show => {
    show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
  });

  return showDates;
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
