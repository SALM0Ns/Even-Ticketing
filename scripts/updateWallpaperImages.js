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
  updateWallpaperImages();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateWallpaperImages() {
  try {
    console.log('🎨 Updating wallpaper images for event detail pages...\n');

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movies = await Movie.find();
    for (const movie of movies) {
      let wallpaperPath = '';
      
      switch(movie.name) {
        case 'Dune':
          wallpaperPath = '/images/dune-wallpaper.jpg';
          break;
        case 'Inception':
          wallpaperPath = '/images/inception-wallpaper.jpg';
          break;
        case 'Kill Bill: Vol. 1':
          wallpaperPath = '/images/killbill-wallpaper.jpg';
          break;
        case 'Oppenheimer':
          wallpaperPath = '/images/oppenheimer-wallpaper.jpg';
          break;
        default:
          wallpaperPath = movie.image; // Keep existing if no wallpaper
      }
      
      movie.image = wallpaperPath;
      await movie.save();
      console.log(`  ✅ ${movie.name}: Updated to ${wallpaperPath}`);
    }

    // Update Stage Plays
    console.log('\n Updating Stage Plays...');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      let wallpaperPath = '';
      
      switch(play.name) {
        case 'Hamilton':
          wallpaperPath = '/images/hamilton-wallpaper.png';
          break;
        case 'The Lion King':
          wallpaperPath = '/images/lionking-wallpaper.jpg';
          break;
        case 'The Phantom of the Opera':
          wallpaperPath = '/images/phantom-wallpaper.png';
          break;
        default:
          wallpaperPath = play.image; // Keep existing if no wallpaper
      }
      
      play.image = wallpaperPath;
      await play.save();
      console.log(`  ✅ ${play.name}: Updated to ${wallpaperPath}`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      let wallpaperPath = '';
      
      switch(concert.name) {
        case 'Beethoven Symphony No. 9 \'Ode to Joy\'':
          wallpaperPath = '/images/beethoven-wallpaper.png';
          break;
        case 'Chopin Piano Concerto No. 1':
          wallpaperPath = '/images/chopin-wallpaper.png';
          break;
        case 'Mozart\'s Requiem':
          wallpaperPath = '/images/mozart-wallpaper.png';
          break;
        case 'Tchaikovsky\'s Swan Lake':
          wallpaperPath = '/images/swan-lake-wallpaper.jpg';
          break;
        default:
          wallpaperPath = concert.image; // Keep existing if no wallpaper
      }
      
      concert.image = wallpaperPath;
      await concert.save();
      console.log(`  ✅ ${concert.name}: Updated to ${wallpaperPath}`);
    }

    console.log('\n🎉 Wallpaper images updated successfully!');
    console.log('📊 Event detail pages will now use wallpaper images as backgrounds');

    // Verify the data
    console.log('\n🔍 Verifying data...');
    const testEvent = await Movie.findOne();
    if (testEvent) {
      console.log(`✅ Verification: ${testEvent.name} now uses ${testEvent.image}`);
    }

  } catch (error) {
    console.error('❌ Error updating wallpaper images:', error);
  } finally {
    mongoose.connection.close();
  }
}
