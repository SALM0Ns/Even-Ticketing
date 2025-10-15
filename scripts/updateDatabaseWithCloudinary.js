const mongoose = require('mongoose');
const fs = require('fs');
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
  updateDatabaseWithCloudinary();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateDatabaseWithCloudinary() {
  try {
    console.log('☁️  Updating database with Cloudinary URLs...\n');

    // Read upload results
    const resultsFile = 'scripts/cloudinary-upload-results.json';
    if (!fs.existsSync(resultsFile)) {
      console.log('❌ Upload results file not found. Please run uploadToCloudinary.js first.');
      return;
    }

    const uploadResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    console.log(`📄 Found ${uploadResults.length} uploaded images\n`);

    // Group results by event name
    const eventImages = {};
    uploadResults.forEach(result => {
      if (!eventImages[result.eventName]) {
        eventImages[result.eventName] = {};
      }
      eventImages[result.eventName][result.type] = {
        url: result.url,
        publicId: result.publicId,
        cloudId: result.cloudId,
        publicUrl: result.publicUrl
      };
    });

    // Update Movies
    console.log('📽️  Updating Movies...');
    const movieUpdates = [
      { name: 'Oppenheimer', images: eventImages['Oppenheimer'] },
      { name: 'Dune', images: eventImages['Dune'] },
      { name: 'Kill Bill: Vol. 1', images: eventImages['Kill Bill'] },
      { name: 'Inception', images: eventImages['Inception'] }
    ];

    for (const update of movieUpdates) {
      if (update.images && update.images.poster && update.images.wallpaper) {
        await Movie.updateOne(
          { name: update.name },
          { 
            $set: { 
              poster: update.images.poster.url,
              wallpaper: update.images.wallpaper.url,
              image: update.images.wallpaper.url, // Keep for backward compatibility
              cloudinary: {
                poster: update.images.poster,
                wallpaper: update.images.wallpaper
              }
            }
          }
        );
        console.log(`  ✅ ${update.name}: Updated with Cloudinary URLs`);
      } else {
        console.log(`  ⚠️  ${update.name}: Missing images, skipping`);
      }
    }

    // Update Stage Plays
    console.log('\n Updating Stage Plays...');
    const stagePlayUpdates = [
      { name: 'The Phantom of the Opera', images: eventImages['Phantom of the Opera'] },
      { name: 'Hamilton', images: eventImages['Hamilton'] },
      { name: 'The Lion King', images: eventImages['Lion King'] }
    ];

    for (const update of stagePlayUpdates) {
      if (update.images && update.images.poster && update.images.wallpaper) {
        await StagePlays.updateOne(
          { name: update.name },
          { 
            $set: { 
              poster: update.images.poster.url,
              wallpaper: update.images.wallpaper.url,
              image: update.images.wallpaper.url, // Keep for backward compatibility
              cloudinary: {
                poster: update.images.poster,
                wallpaper: update.images.wallpaper
              }
            }
          }
        );
        console.log(`  ✅ ${update.name}: Updated with Cloudinary URLs`);
      } else {
        console.log(`  ⚠️  ${update.name}: Missing images, skipping`);
      }
    }

    // Update Live Orchestra
    console.log('\n🎼 Updating Live Orchestra...');
    const orchestraUpdates = [
      { name: 'Chopin Piano Concerto No. 1', images: eventImages['Chopin Piano Concerto'] },
      { name: 'Beethoven Symphony No. 9 \'Ode to Joy\'', images: eventImages['Beethoven Symphony'] },
      { name: 'Mozart\'s Requiem', images: eventImages['Mozart Requiem'] },
      { name: 'Tchaikovsky\'s Swan Lake', images: eventImages['Swan Lake'] }
    ];

    for (const update of orchestraUpdates) {
      if (update.images && update.images.poster && update.images.wallpaper) {
        await LiveOrchestra.updateOne(
          { name: update.name },
          { 
            $set: { 
              poster: update.images.poster.url,
              wallpaper: update.images.wallpaper.url,
              image: update.images.wallpaper.url, // Keep for backward compatibility
              cloudinary: {
                poster: update.images.poster,
                wallpaper: update.images.wallpaper
              }
            }
          }
        );
        console.log(`  ✅ ${update.name}: Updated with Cloudinary URLs`);
      } else {
        console.log(`  ⚠️  ${update.name}: Missing images, skipping`);
      }
    }

    console.log('\n🎉 Database update completed!');
    console.log('📊 All events now use Cloudinary URLs:');
    console.log('   ✅ Homepage: Uses Cloudinary poster URLs');
    console.log('   ✅ Detail pages: Uses Cloudinary wallpaper URLs');
    console.log('   ✅ Optimized images with automatic format and quality');
    console.log('   ✅ Global CDN for fast loading worldwide');

  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    mongoose.connection.close();
  }
}
