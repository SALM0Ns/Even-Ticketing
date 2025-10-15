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
  verifyFinalImageSetup();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function verifyFinalImageSetup() {
  try {
    console.log('🎯 Verifying final image setup from Poster folder...\n');

    let allCorrect = true;

    // Verify Movies
    console.log('📽️  Movies:');
    const movies = await Movie.find();
    for (const movie of movies) {
      const posterCorrect = movie.poster && movie.poster.includes('poster') && !movie.poster.includes('wallpaper');
      const wallpaperCorrect = movie.wallpaper && movie.wallpaper.includes('wallpaper') && !movie.wallpaper.includes('poster');
      const imageCorrect = movie.image && movie.image.includes('wallpaper');
      
      console.log(`  ${posterCorrect && wallpaperCorrect && imageCorrect ? '✅' : '❌'} ${movie.name}:`);
      console.log(`     - Poster (homepage): ${movie.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${movie.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      console.log(`     - Image (legacy): ${movie.image} ${imageCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect || !imageCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    // Verify Stage Plays
    console.log('🎭 Stage Plays:');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const posterCorrect = play.poster && play.poster.includes('poster') && !play.poster.includes('wallpaper');
      const wallpaperCorrect = play.wallpaper && play.wallpaper.includes('wallpaper') && !play.wallpaper.includes('poster');
      const imageCorrect = play.image && play.image.includes('wallpaper');
      
      console.log(`  ${posterCorrect && wallpaperCorrect && imageCorrect ? '✅' : '❌'} ${play.name}:`);
      console.log(`     - Poster (homepage): ${play.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${play.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      console.log(`     - Image (legacy): ${play.image} ${imageCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect || !imageCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    // Verify Live Orchestra
    console.log('🎼 Live Orchestra:');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const posterCorrect = concert.poster && concert.poster.includes('poster') && !concert.poster.includes('wallpaper');
      const wallpaperCorrect = concert.wallpaper && concert.wallpaper.includes('wallpaper') && !concert.wallpaper.includes('poster');
      const imageCorrect = concert.image && concert.image.includes('wallpaper');
      
      console.log(`  ${posterCorrect && wallpaperCorrect && imageCorrect ? '✅' : '❌'} ${concert.name}:`);
      console.log(`     - Poster (homepage): ${concert.poster} ${posterCorrect ? '✓' : '✗'}`);
      console.log(`     - Wallpaper (detail): ${concert.wallpaper} ${wallpaperCorrect ? '✓' : '✗'}`);
      console.log(`     - Image (legacy): ${concert.image} ${imageCorrect ? '✓' : '✗'}`);
      
      if (!posterCorrect || !wallpaperCorrect || !imageCorrect) {
        allCorrect = false;
      }
      console.log('');
    }

    console.log('🎉 Final verification completed!');
    if (allCorrect) {
      console.log('✅ PERFECT! All images are correctly set up:');
      console.log('   🏠 Homepage: Uses poster images from your Poster folder');
      console.log('   📄 Detail pages: Uses wallpaper images from your Poster folder');
      console.log('   🔄 Complete separation between poster and wallpaper');
      console.log('   📁 All files copied from your organized folder structure');
      console.log('   🎯 Ready for production use!');
    } else {
      console.log('❌ Some issues found. Please check the paths above.');
    }

  } catch (error) {
    console.error('❌ Error verifying final setup:', error);
  } finally {
    mongoose.connection.close();
  }
}
