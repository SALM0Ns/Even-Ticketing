const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔧 Testing Homepage Route Logic...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return testHomepageLogic();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function testHomepageLogic() {
  try {
    console.log('📽️  Fetching featured movies...');
    const featuredMovies = await Movie.find().sort({ date: 1 }).limit(3);
    console.log(`   Found ${featuredMovies.length} featured movies`);
    
    console.log('\n🎭 Fetching featured stage plays...');
    const featuredPlays = await StagePlays.find().sort({ date: 1 }).limit(3);
    console.log(`   Found ${featuredPlays.length} featured stage plays`);
    
    console.log('\n🎼 Fetching featured orchestra...');
    const featuredOrchestra = await LiveOrchestra.find().sort({ date: 1 }).limit(3);
    console.log(`   Found ${featuredOrchestra.length} featured orchestra events`);
    
    console.log('\n🔄 Combining and shuffling featured events...');
    const allFeatured = [...featuredMovies, ...featuredPlays, ...featuredOrchestra];
    console.log(`   Total events: ${allFeatured.length}`);
    
    const shuffledFeatured = allFeatured.sort(() => 0.5 - Math.random()).slice(0, 6);
    console.log(`   Shuffled and limited to: ${shuffledFeatured.length} events`);
    
    console.log('\n📋 Featured Events List:');
    shuffledFeatured.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.name} (${event.constructor.modelName})`);
    });
    
    console.log('\n🎉 Homepage route logic working correctly!');
    
  } catch (error) {
    console.error('❌ Homepage route test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}
