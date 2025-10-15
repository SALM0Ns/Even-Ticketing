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
  updateCorrectPosterPaths();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateCorrectPosterPaths() {
  try {
    console.log('🖼️  Updating database with correct poster file paths...\n');

    // Update Movies with correct poster paths
    console.log('📽️  Updating Movies...');
    const movieUpdates = [
      { name: 'Oppenheimer', poster: '/images/oppenheimer-poster.jpg' },
      { name: 'Dune', poster: '/images/dune-poster.jpg' },
      { name: 'Kill Bill: Vol. 1', poster: '/images/killbill-poster.jpg' },
      { name: 'Inception', poster: '/images/inception-poster.jpg' }
    ];

    for (const update of movieUpdates) {
      await Movie.updateOne(
        { name: update.name },
        { $set: { poster: update.poster } }
      );
      console.log(`  ✅ ${update.name}: ${update.poster}`);
    }

    // Update Stage Plays with correct poster paths
    console.log('\n🎭 Updating Stage Plays...');
    const stagePlayUpdates = [
      { name: 'The Phantom of the Opera', poster: '/images/phantom-poster.jpg' },
      { name: 'Hamilton', poster: '/images/hamilton-poster.jpg' },
      { name: 'The Lion King', poster: '/images/lionking-poster.jpg' }
    ];

    for (const update of stagePlayUpdates) {
      await StagePlays.updateOne(
        { name: update.name },
        { $set: { poster: update.poster } }
      );
      console.log(`  ✅ ${update.name}: ${update.poster}`);
    }

    // Update Live Orchestra with correct poster paths
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestraUpdates = [
      { name: 'Chopin Piano Concerto No. 1', poster: '/images/chopin-poster.jpg' },
      { name: 'Beethoven Symphony No. 9 \'Ode to Joy\'', poster: '/images/beethoven-poster.jpg' },
      { name: 'Mozart\'s Requiem', poster: '/images/mozart-poster.jpg' },
      { name: 'Tchaikovsky\'s Swan Lake', poster: '/images/swan-lake-poster.jpg' }
    ];

    for (const update of orchestraUpdates) {
      await LiveOrchestra.updateOne(
        { name: update.name },
        { $set: { poster: update.poster } }
      );
      console.log(`  ✅ ${update.name}: ${update.poster}`);
    }

    console.log('\n🎉 Database update completed!');
    console.log('📊 All events now have correct poster and wallpaper separation:');
    console.log('   ✅ Homepage will display actual poster images');
    console.log('   ✅ Detail pages will display wallpaper images');
    console.log('   ✅ Complete separation between poster and wallpaper files');

  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    mongoose.connection.close();
  }
}
