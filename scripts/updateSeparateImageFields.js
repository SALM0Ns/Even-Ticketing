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
  updateSeparateImageFields();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateSeparateImageFields() {
  try {
    console.log('🖼️  Updating database with separate poster and wallpaper fields...\n');

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movies = await Movie.find();
    for (const movie of movies) {
      // Set poster to current image (which should be poster)
      // Set wallpaper to the wallpaper version
      const posterPath = movie.image.replace('-wallpaper', '-poster').replace('wallpaper', 'poster');
      const wallpaperPath = movie.image.replace('-poster', '-wallpaper').replace('poster', 'wallpaper');
      
      await Movie.updateOne(
        { _id: movie._id },
        { 
          $set: { 
            poster: posterPath,
            wallpaper: wallpaperPath
          }
        }
      );
      
      console.log(`  ✅ ${movie.name}:`);
      console.log(`     - Poster: ${posterPath}`);
      console.log(`     - Wallpaper: ${wallpaperPath}`);
    }

    // Update Stage Plays
    console.log('\n🎭 Updating Stage Plays...');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const posterPath = play.image.replace('-wallpaper', '-poster').replace('wallpaper', 'poster');
      const wallpaperPath = play.image.replace('-poster', '-wallpaper').replace('poster', 'wallpaper');
      
      await StagePlays.updateOne(
        { _id: play._id },
        { 
          $set: { 
            poster: posterPath,
            wallpaper: wallpaperPath
          }
        }
      );
      
      console.log(`  ✅ ${play.name}:`);
      console.log(`     - Poster: ${posterPath}`);
      console.log(`     - Wallpaper: ${wallpaperPath}`);
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const posterPath = concert.image.replace('-wallpaper', '-poster').replace('wallpaper', 'poster');
      const wallpaperPath = concert.image.replace('-poster', '-wallpaper').replace('poster', 'wallpaper');
      
      await LiveOrchestra.updateOne(
        { _id: concert._id },
        { 
          $set: { 
            poster: posterPath,
            wallpaper: wallpaperPath
          }
        }
      );
      
      console.log(`  ✅ ${concert.name}:`);
      console.log(`     - Poster: ${posterPath}`);
      console.log(`     - Wallpaper: ${wallpaperPath}`);
    }

    console.log('\n🎉 Database update completed!');
    console.log('📊 All events now have separate poster and wallpaper fields:');
    console.log('   ✅ Homepage will use poster images');
    console.log('   ✅ Detail pages will use wallpaper images');
    console.log('   ✅ Original image field preserved for backward compatibility');

  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    mongoose.connection.close();
  }
}
