const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔍 Checking Event ID: 68ee4b9919d30215d4b0b377\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return checkEventId();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function checkEventId() {
  try {
    const targetId = '68ee4b9919d30215d4b0b377';
    
    console.log('📽️  Checking Movies...');
    const movie = await Movie.findById(targetId);
    if (movie) {
      console.log(`   ✅ Found in Movies: ${movie.name}`);
      console.log(`   📅 Date: ${movie.date}`);
      console.log(`   🎬 Category: Movie`);
      return;
    } else {
      console.log('   ❌ Not found in Movies');
    }

    console.log('\nChecking Stage Plays...');
    const stagePlay = await StagePlays.findById(targetId);
    if (stagePlay) {
      console.log(`   ✅ Found in Stage Plays: ${stagePlay.name}`);
      console.log(`   📅 Date: ${stagePlay.date}`);
      console.log(`    Category: Stage Play`);
      return;
    } else {
      console.log('   ❌ Not found in Stage Plays');
    }

    console.log('\n🎼 Checking Live Orchestra...');
    const orchestra = await LiveOrchestra.findById(targetId);
    if (orchestra) {
      console.log(`   ✅ Found in Live Orchestra: ${orchestra.name}`);
      console.log(`   📅 Date: ${orchestra.date}`);
      console.log(`   🎼 Category: Live Orchestra`);
      return;
    } else {
      console.log('   ❌ Not found in Live Orchestra');
    }

    console.log('\n🔍 Event ID not found in any collection!');
    console.log('\n📋 Available Events:');
    
    console.log('\n📽️  Movies:');
    const movies = await Movie.find({}, '_id name');
    movies.forEach(movie => {
      console.log(`   ${movie._id} - ${movie.name}`);
    });

    console.log('\n Stage Plays:');
    const stagePlays = await StagePlays.find({}, '_id name');
    stagePlays.forEach(play => {
      console.log(`   ${play._id} - ${play.name}`);
    });

    console.log('\n🎼 Live Orchestra:');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name');
    orchestraEvents.forEach(concert => {
      console.log(`   ${concert._id} - ${concert.name}`);
    });

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
