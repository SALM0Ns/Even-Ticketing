const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📍 Checking All Event Locations...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return checkLocations();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function checkLocations() {
  try {
    console.log('📽️  Movie Locations:');
    const movies = await Movie.find({}, '_id name location venue');
    movies.forEach(movie => {
      console.log(`   🎬 ${movie.name}:`);
      console.log(`      📍 Location: ${movie.location || 'Not set'}`);
      console.log(`      🏢 Venue: ${movie.venue || 'Not set'}`);
      console.log('');
    });

    console.log(' Stage Play Locations:');
    const stagePlays = await StagePlays.find({}, '_id name location venue');
    stagePlays.forEach(play => {
      console.log(`    ${play.name}:`);
      console.log(`      📍 Location: ${play.location || 'Not set'}`);
      console.log(`      🏢 Venue: ${play.venue || 'Not set'}`);
      console.log('');
    });

    console.log('🎼 Live Orchestra Locations:');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name location venue');
    orchestraEvents.forEach(concert => {
      console.log(`   🎼 ${concert.name}:`);
      console.log(`      📍 Location: ${concert.location || 'Not set'}`);
      console.log(`      🏢 Venue: ${concert.venue || 'Not set'}`);
      console.log('');
    });

    // Summary
    console.log('📊 Location Summary:');
    const allEvents = [
      ...movies.map(m => ({ name: m.name, location: m.location, venue: m.venue, type: 'Movie' })),
      ...stagePlays.map(p => ({ name: p.name, location: p.location, venue: p.venue, type: 'Stage Play' })),
      ...orchestraEvents.map(o => ({ name: o.name, location: o.location, venue: o.venue, type: 'Live Orchestra' }))
    ];

    const uniqueLocations = [...new Set(allEvents.map(e => e.location).filter(l => l))];
    const uniqueVenues = [...new Set(allEvents.map(e => e.venue).filter(v => v))];

    console.log(`   📍 Total Unique Locations: ${uniqueLocations.length}`);
    uniqueLocations.forEach(location => {
      console.log(`      - ${location}`);
    });

    console.log(`\n   🏢 Total Unique Venues: ${uniqueVenues.length}`);
    uniqueVenues.forEach(venue => {
      console.log(`      - ${venue}`);
    });

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
