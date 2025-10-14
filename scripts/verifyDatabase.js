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

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying all database entries...\n');

    // Check Movies
    console.log('📽️  MOVIES:');
    const movies = await Movie.find();
    movies.forEach(movie => {
      console.log(`  ✅ ${movie.name}`);
      console.log(`     Image: ${movie.image}`);
      console.log(`     Date: ${movie.date}`);
      console.log(`     Location: ${movie.location.name}`);
      console.log(`     Price: $${movie.pricing.basePrice}`);
      console.log('');
    });

    // Check Stage Plays
    console.log('🎭 STAGE PLAYS:');
    const stagePlays = await StagePlays.find();
    stagePlays.forEach(play => {
      console.log(`  ✅ ${play.name}`);
      console.log(`     Image: ${play.image}`);
      console.log(`     Date: ${play.date}`);
      console.log(`     Location: ${play.location.name}`);
      console.log(`     Price: $${play.pricing.basePrice}`);
      console.log('');
    });

    // Check Live Orchestra
    console.log('🎼 LIVE ORCHESTRA:');
    const orchestra = await LiveOrchestra.find();
    orchestra.forEach(concert => {
      console.log(`  ✅ ${concert.name}`);
      console.log(`     Image: ${concert.image}`);
      console.log(`     Date: ${concert.date}`);
      console.log(`     Location: ${concert.location.name}`);
      console.log(`     Price: $${concert.pricing.basePrice}`);
      console.log('');
    });

    // Summary
    console.log('📊 DATABASE SUMMARY:');
    console.log(`  Movies: ${movies.length} entries`);
    console.log(`  Stage Plays: ${stagePlays.length} entries`);
    console.log(`  Live Orchestra: ${orchestra.length} entries`);
    console.log(`  Total Events: ${movies.length + stagePlays.length + orchestra.length} entries`);

    // Verify specific poster updates
    console.log('\n🖼️  POSTER VERIFICATION:');
    const dune = await Movie.findOne({ name: /dune/i });
    const hamilton = await StagePlays.findOne({ name: /hamilton/i });
    const phantom = await StagePlays.findOne({ name: /phantom/i });
    const beethoven = await LiveOrchestra.findOne({ name: /beethoven/i });
    const chopin = await LiveOrchestra.findOne({ name: /chopin/i });

    console.log(`  Dune: ${dune?.image} ${dune?.image === '/images/dune-poster.jpg' ? '✅' : '❌'}`);
    console.log(`  Hamilton: ${hamilton?.image} ${hamilton?.image === '/images/hamilton.webp' ? '✅' : '❌'}`);
    console.log(`  Phantom: ${phantom?.image} ${phantom?.image === '/images/phantom.webp' ? '✅' : '❌'}`);
    console.log(`  Beethoven: ${beethoven?.image} ${beethoven?.image === '/images/beethoven9-poster.jpg' ? '✅' : '❌'}`);
    console.log(`  Chopin: ${chopin?.image} ${chopin?.image === '/images/chopin-poster.jpg' ? '✅' : '❌'}`);

    console.log('\n✅ Database verification completed!');

  } catch (error) {
    console.error('❌ Error verifying database:', error);
  } finally {
    mongoose.connection.close();
  }
}

verifyDatabase();
