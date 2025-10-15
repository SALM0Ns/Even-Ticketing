const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔗 Generating Event URLs...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return generateUrls();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function generateUrls() {
  try {
    console.log('📽️  Movie URLs:');
    const movies = await Movie.find({}, '_id name');
    movies.forEach(movie => {
      console.log(`   ${movie.name}:`);
      console.log(`   http://localhost:3000/events/movies/${movie._id}`);
      console.log('');
    });

    console.log('🎭 Stage Play URLs:');
    const stagePlays = await StagePlays.find({}, '_id name');
    stagePlays.forEach(play => {
      console.log(`   ${play.name}:`);
      console.log(`   http://localhost:3000/events/stage-plays/${play._id}`);
      console.log('');
    });

    console.log('🎼 Live Orchestra URLs:');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name');
    orchestraEvents.forEach(concert => {
      console.log(`   ${concert.name}:`);
      console.log(`   http://localhost:3000/events/orchestra/${concert._id}`);
      console.log('');
    });

    console.log('🎉 All Event URLs generated!');
    console.log('\n💡 Copy any URL above to test the Countdown Timer!');

  } catch (error) {
    console.error('❌ URL generation failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
