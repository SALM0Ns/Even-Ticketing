const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔧 Testing Models...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return testModels();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function testModels() {
  try {
    console.log('📽️  Testing Movie model...');
    const movieCount = await Movie.countDocuments();
    console.log(`   Found ${movieCount} movies`);
    
    if (movieCount > 0) {
      const sampleMovie = await Movie.findOne();
      console.log(`   Sample: ${sampleMovie.name}`);
      console.log(`   Poster: ${sampleMovie.poster ? 'Available' : 'Missing'}`);
      console.log(`   Wallpaper: ${sampleMovie.wallpaper ? 'Available' : 'Missing'}`);
    }

    console.log('\n Testing StagePlays model...');
    const playCount = await StagePlays.countDocuments();
    console.log(`   Found ${playCount} stage plays`);
    
    if (playCount > 0) {
      const samplePlay = await StagePlays.findOne();
      console.log(`   Sample: ${samplePlay.name}`);
      console.log(`   Poster: ${samplePlay.poster ? 'Available' : 'Missing'}`);
      console.log(`   Wallpaper: ${samplePlay.wallpaper ? 'Available' : 'Missing'}`);
    }

    console.log('\n🎼 Testing LiveOrchestra model...');
    const orchestraCount = await LiveOrchestra.countDocuments();
    console.log(`   Found ${orchestraCount} orchestra events`);
    
    if (orchestraCount > 0) {
      const sampleOrchestra = await LiveOrchestra.findOne();
      console.log(`   Sample: ${sampleOrchestra.name}`);
      console.log(`   Poster: ${sampleOrchestra.poster ? 'Available' : 'Missing'}`);
      console.log(`   Wallpaper: ${sampleOrchestra.wallpaper ? 'Available' : 'Missing'}`);
    }

    console.log('\n🎉 All models working correctly!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}
