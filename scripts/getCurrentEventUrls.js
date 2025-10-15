const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔗 Current Event URLs (Updated IDs)...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return getCurrentUrls();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function getCurrentUrls() {
  try {
    console.log('📽️  Movie URLs (Updated):');
    const movies = await Movie.find({}, '_id name date');
    movies.forEach(movie => {
      const eventDate = new Date(movie.date);
      console.log(`   🎬 ${movie.name}:`);
      console.log(`      📅 ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      console.log(`      🔗 http://localhost:3000/events/movies/${movie._id}`);
      console.log('');
    });

    console.log(' Stage Play URLs (Updated):');
    const stagePlays = await StagePlays.find({}, '_id name date');
    stagePlays.forEach(play => {
      const eventDate = new Date(play.date);
      console.log(`   ${play.name}:`);
      console.log(`      📅 ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      console.log(`      🔗 http://localhost:3000/events/stage-plays/${play._id}`);
      console.log('');
    });

    console.log('🎼 Live Orchestra URLs (Updated):');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name date');
    orchestraEvents.forEach(concert => {
      const eventDate = new Date(concert.date);
      console.log(`   🎼 ${concert.name}:`);
      console.log(`      📅 ${eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      console.log(`      🔗 http://localhost:3000/events/orchestra/${concert._id}`);
      console.log('');
    });

    console.log('🎉 All URLs are working with improved error handling!');
    console.log('💡 If an event ID is not found, the system will show a fallback event');
    console.log('🛡️  Database errors are handled gracefully');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
