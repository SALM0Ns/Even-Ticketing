const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const LiveOrchestra = require('../models/LiveOrchestra');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME || 'Event'
});

async function updateBeethovenChopinPosters() {
  try {
    console.log('🔄 Updating Beethoven and Chopin poster images...');

    // Update Beethoven
    const beethovenUpdate = await LiveOrchestra.updateOne(
      { name: /beethoven/i },
      { $set: { image: '/images/beethoven9-poster.jpg' } }
    );
    console.log('✅ Beethoven poster updated:', beethovenUpdate.modifiedCount > 0);

    // Update Chopin
    const chopinUpdate = await LiveOrchestra.updateOne(
      { name: /chopin/i },
      { $set: { image: '/images/chopin-poster.jpg' } }
    );
    console.log('✅ Chopin poster updated:', chopinUpdate.modifiedCount > 0);

    console.log('🎉 Poster updates completed!');
    
    // Verify updates
    console.log('\n📋 Verifying updates:');
    const beethoven = await LiveOrchestra.findOne({ name: /beethoven/i });
    const chopin = await LiveOrchestra.findOne({ name: /chopin/i });

    console.log('Beethoven image:', beethoven?.image);
    console.log('Chopin image:', chopin?.image);

  } catch (error) {
    console.error('❌ Error updating poster images:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateBeethovenChopinPosters();
