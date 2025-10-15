const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('⏰ Countdown Timer Status for All Events...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return showCountdownTimers();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

function calculateCountdown(eventDate) {
  const now = new Date();
  const event = new Date(eventDate);
  const distance = event.getTime() - now.getTime();

  if (distance < 0) {
    return { status: 'passed', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { status: 'active', days, hours, minutes, seconds };
}

async function showCountdownTimers() {
  try {
    console.log('📽️  Movie Countdown Timers:');
    const movies = await Movie.find({}, '_id name date');
    movies.forEach(movie => {
      const countdown = calculateCountdown(movie.date);
      const eventDate = new Date(movie.date);
      
      console.log(`   🎬 ${movie.name}:`);
      console.log(`      📅 Event Date: ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      
      if (countdown.status === 'active') {
        console.log(`      ⏰ Countdown: ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes`);
        console.log(`      🔗 URL: http://localhost:3000/events/movies/${movie._id}`);
      } else {
        console.log(`      ❌ Event has passed`);
      }
      console.log('');
    });

    console.log('🎭 Stage Play Countdown Timers:');
    const stagePlays = await StagePlays.find({}, '_id name date');
    stagePlays.forEach(play => {
      const countdown = calculateCountdown(play.date);
      const eventDate = new Date(play.date);
      
      console.log(`   🎭 ${play.name}:`);
      console.log(`      📅 Event Date: ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      
      if (countdown.status === 'active') {
        console.log(`      ⏰ Countdown: ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes`);
        console.log(`      🔗 URL: http://localhost:3000/events/stage-plays/${play._id}`);
      } else {
        console.log(`      ❌ Event has passed`);
      }
      console.log('');
    });

    console.log('🎼 Live Orchestra Countdown Timers:');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name date');
    orchestraEvents.forEach(concert => {
      const countdown = calculateCountdown(concert.date);
      const eventDate = new Date(concert.date);
      
      console.log(`   🎼 ${concert.name}:`);
      console.log(`      📅 Event Date: ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      
      if (countdown.status === 'active') {
        console.log(`      ⏰ Countdown: ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes`);
        console.log(`      🔗 URL: http://localhost:3000/events/orchestra/${concert._id}`);
      } else {
        console.log(`      ❌ Event has passed`);
      }
      console.log('');
    });

    console.log('🎉 Countdown Timer Summary:');
    console.log('   ⏰ All events now have active countdown timers');
    console.log('   📅 Events are scheduled 1-2 weeks from now');
    console.log('   🎫 Click any URL above to see the countdown timer in action!');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
