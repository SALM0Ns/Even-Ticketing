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
  updateAllImagePaths();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateAllImagePaths() {
  try {
    console.log('🖼️  Updating all image paths in database...\n');

    // Update Movies with correct paths
    console.log('📽️  Updating Movies...');
    const movieUpdates = [
      { name: 'Oppenheimer', poster: '/images/oppenheimer-poster.jpg', wallpaper: '/images/oppenheimer-wallpaper.jpg' },
      { name: 'Dune', poster: '/images/dune-poster.jpg', wallpaper: '/images/dune-wallpaper.jpg' },
      { name: 'Kill Bill: Vol. 1', poster: '/images/killbill-poster.jpg', wallpaper: '/images/killbill-wallpaper.jpg' },
      { name: 'Inception', poster: '/images/inception-poster.jpg', wallpaper: '/images/inception-wallpaper.jpg' }
    ];

    for (const update of movieUpdates) {
      await Movie.updateOne(
        { name: update.name },
        { 
          $set: { 
            poster: update.poster,
            wallpaper: update.wallpaper,
            image: update.wallpaper // Keep image field as wallpaper for backward compatibility
          }
        }
      );
      console.log(`  ✅ ${update.name}:`);
      console.log(`     - Poster: ${update.poster}`);
      console.log(`     - Wallpaper: ${update.wallpaper}`);
    }

    // Update Stage Plays with correct paths
    console.log('\n🎭 Updating Stage Plays...');
    const stagePlayUpdates = [
      { name: 'The Phantom of the Opera', poster: '/images/phantom-poster.jpg', wallpaper: '/images/phantom-wallpaper.png' },
      { name: 'Hamilton', poster: '/images/hamilton-poster.jpg', wallpaper: '/images/hamilton-wallpaper.png' },
      { name: 'The Lion King', poster: '/images/lionking-poster.jpg', wallpaper: '/images/lionking-wallpaper.jpg' }
    ];

    for (const update of stagePlayUpdates) {
      await StagePlays.updateOne(
        { name: update.name },
        { 
          $set: { 
            poster: update.poster,
            wallpaper: update.wallpaper,
            image: update.wallpaper // Keep image field as wallpaper for backward compatibility
          }
        }
      );
      console.log(`  ✅ ${update.name}:`);
      console.log(`     - Poster: ${update.poster}`);
      console.log(`     - Wallpaper: ${update.wallpaper}`);
    }

    // Update Live Orchestra with correct paths
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestraUpdates = [
      { name: 'Chopin Piano Concerto No. 1', poster: '/images/chopin-poster.jpg', wallpaper: '/images/chopin-wallpaper.png' },
      { name: 'Beethoven Symphony No. 9 \'Ode to Joy\'', poster: '/images/beethoven-poster.jpg', wallpaper: '/images/beethoven-wallpaper.png' },
      { name: 'Mozart\'s Requiem', poster: '/images/mozart-poster.jpg', wallpaper: '/images/mozart-wallpaper.png' },
      { name: 'Tchaikovsky\'s Swan Lake', poster: '/images/swan-lake-poster.jpg', wallpaper: '/images/swan-lake-wallpaper.jpg' }
    ];

    for (const update of orchestraUpdates) {
      await LiveOrchestra.updateOne(
        { name: update.name },
        { 
          $set: { 
            poster: update.poster,
            wallpaper: update.wallpaper,
            image: update.wallpaper // Keep image field as wallpaper for backward compatibility
          }
        }
      );
      console.log(`  ✅ ${update.name}:`);
      console.log(`     - Poster: ${update.poster}`);
      console.log(`     - Wallpaper: ${update.wallpaper}`);
    }

    console.log('\n🎉 Database update completed!');
    console.log('📊 All events now have correct image paths:');
    console.log('   ✅ Homepage: Uses poster images from Poster folder');
    console.log('   ✅ Detail pages: Uses wallpaper images from Poster folder');
    console.log('   ✅ Complete separation between poster and wallpaper');
    console.log('   ✅ All files copied from your organized Poster folder');

  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    mongoose.connection.close();
  }
}
