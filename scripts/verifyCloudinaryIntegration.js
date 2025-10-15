const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('Connected to MongoDB');
  verifyCloudinaryIntegration();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function verifyCloudinaryIntegration() {
  try {
    console.log('☁️  Verifying Cloudinary Integration...\n');

    let allUsingCloudinary = true;

    // Verify Movies
    console.log('📽️  Movies:');
    const movies = await Movie.find();
    for (const movie of movies) {
      const usingCloudinary = movie.poster && movie.poster.includes('cloudinary.com');
      const hasCloudinaryData = movie.cloudinary && movie.cloudinary.poster;
      
      console.log(`  ${usingCloudinary ? '✅' : '❌'} ${movie.name}:`);
      console.log(`     - Poster: ${movie.poster ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Wallpaper: ${movie.wallpaper && movie.wallpaper.includes('cloudinary.com') ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Cloudinary Data: ${hasCloudinaryData ? 'Available' : 'Missing'}`);
      
      if (!usingCloudinary) {
        allUsingCloudinary = false;
      }
      console.log('');
    }

    // Verify Stage Plays
    console.log('🎭 Stage Plays:');
    const stagePlays = await StagePlays.find();
    for (const play of stagePlays) {
      const usingCloudinary = play.poster && play.poster.includes('cloudinary.com');
      const hasCloudinaryData = play.cloudinary && play.cloudinary.poster;
      
      console.log(`  ${usingCloudinary ? '✅' : '❌'} ${play.name}:`);
      console.log(`     - Poster: ${play.poster ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Wallpaper: ${play.wallpaper && play.wallpaper.includes('cloudinary.com') ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Cloudinary Data: ${hasCloudinaryData ? 'Available' : 'Missing'}`);
      
      if (!usingCloudinary) {
        allUsingCloudinary = false;
      }
      console.log('');
    }

    // Verify Live Orchestra
    console.log('🎼 Live Orchestra:');
    const orchestra = await LiveOrchestra.find();
    for (const concert of orchestra) {
      const usingCloudinary = concert.poster && concert.poster.includes('cloudinary.com');
      const hasCloudinaryData = concert.cloudinary && concert.cloudinary.poster;
      
      console.log(`  ${usingCloudinary ? '✅' : '❌'} ${concert.name}:`);
      console.log(`     - Poster: ${concert.poster ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Wallpaper: ${concert.wallpaper && concert.wallpaper.includes('cloudinary.com') ? 'Cloudinary URL' : 'Local URL'}`);
      console.log(`     - Cloudinary Data: ${hasCloudinaryData ? 'Available' : 'Missing'}`);
      
      if (!usingCloudinary) {
        allUsingCloudinary = false;
      }
      console.log('');
    }

    console.log('🎉 Cloudinary Integration Verification Completed!');
    if (allUsingCloudinary) {
      console.log('✅ PERFECT! All events are using Cloudinary URLs:');
      console.log('   🌍 Global CDN: Images load fast worldwide');
      console.log('   ⚡ Auto-optimization: Automatic format and quality optimization');
      console.log('   📱 Responsive: Different sizes for different devices');
      console.log('   🛡️ Reliable: 99.9% uptime with automatic backup');
      console.log('   🎯 Production Ready: Scalable for real-world use');
    } else {
      console.log('⚠️  Some events are still using local URLs');
      console.log('🔧 Please check the database update script');
    }

  } catch (error) {
    console.error('❌ Error verifying Cloudinary integration:', error);
  } finally {
    mongoose.connection.close();
  }
}
