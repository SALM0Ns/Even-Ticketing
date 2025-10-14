const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME || 'Event'
});

async function updateImagePaths() {
  try {
    console.log('🔄 Updating image paths to use .webp format...');

    // Update StagePlays
    const hamiltonUpdate = await StagePlays.updateOne(
      { name: /hamilton/i },
      { $set: { image: '/images/hamilton.webp' } }
    );
    console.log('✅ Hamilton image updated:', hamiltonUpdate.modifiedCount > 0);

    const phantomUpdate = await StagePlays.updateOne(
      { name: /phantom/i },
      { $set: { image: '/images/phantom.webp' } }
    );
    console.log('✅ Phantom image updated:', phantomUpdate.modifiedCount > 0);

    // Update LiveOrchestra
    const beethovenUpdate = await LiveOrchestra.updateOne(
      { name: /beethoven/i },
      { $set: { image: '/images/beethoven9.webp' } }
    );
    console.log('✅ Beethoven image updated:', beethovenUpdate.modifiedCount > 0);

    const chopinUpdate = await LiveOrchestra.updateOne(
      { name: /chopin/i },
      { $set: { image: '/images/chopin.webp' } }
    );
    console.log('✅ Chopin image updated:', chopinUpdate.modifiedCount > 0);

    console.log('🎉 Image path updates completed!');
    
    // Verify updates
    console.log('\n📋 Verifying updates:');
    const hamilton = await StagePlays.findOne({ name: /hamilton/i });
    const phantom = await StagePlays.findOne({ name: /phantom/i });
    const beethoven = await LiveOrchestra.findOne({ name: /beethoven/i });
    const chopin = await LiveOrchestra.findOne({ name: /chopin/i });

    console.log('Hamilton image:', hamilton?.image);
    console.log('Phantom image:', phantom?.image);
    console.log('Beethoven image:', beethoven?.image);
    console.log('Chopin image:', chopin?.image);

  } catch (error) {
    console.error('❌ Error updating image paths:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateImagePaths();
