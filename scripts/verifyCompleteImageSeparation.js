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
  verifyCompleteImageSeparation();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function verifyCompleteImageSeparation() {
  try {
    console.log('🖼️  Verifying complete poster and wallpaper separation...\n');

    let allCorrect = true;

    // Verify Movies
    console.log('📽️  Movies:');
    const movies = await Movie.find();
    for (const movie of movies) {
      const posterCorrect = movie.poster.includes('poster') && !movie.poster.includes('wallpaper');
      const wallpaperCorrect = movie.wallpaper.includes('wallpaper') && !movie.wallpaper.includes('poster');
      
      console.log(`  ${posterCorrect && wallpaperCorrect ? '✅' : '❌'} ${movie.name}:`);
      console.log(`     - Poster (homepage): ${movie.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${movie.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    // Verify Stage Plays
    console.log('🎭 Stage Plays:');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const posterCorrect = play.poster.includes('poster') && !play.poster.includes('wallpaper');
      const wallpaperCorrect = play.wallpaper.includes('wallpaper') && !play.wallpaper.includes('poster');
      
      console.log(`  ${posterCorrect && wallpaperCorrect ? '✅' : '❌'} ${play.name}:`);
      console.log(`     - Poster (homepage): ${play.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${play.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    // Verify Live Orchestra
    console.log('🎼 Live Orchestra:');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const posterCorrect = concert.poster.includes('poster') && !concert.poster.includes('wallpaper');
      const wallpaperCorrect = concert.wallpaper.includes('wallpaper') && !concert.wallpaper.includes('poster');
      
      console.log(`  ${posterCorrect && wallpaperCorrect ? '✅' : '❌'} ${concert.name}:`);
      console.log(`     - Poster (homepage): ${concert.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${concert.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    console.log('🎉 Verification completed!');
    if (allCorrect) {
      console.log('✅ PERFECT! Complete image separation achieved:');
      console.log('   🏠 Homepage: Uses actual poster images');
      console.log('   📄 Detail pages: Uses wallpaper images');
      console.log('   🔄 No more mixing of poster and wallpaper files');
    } else {
      console.log('❌ Some issues found. Please check the paths above.');
    }

  } catch (error) {
    console.error('❌ Error verifying image separation:', error);
  } finally {
    mongoose.connection.close();
  }
}
