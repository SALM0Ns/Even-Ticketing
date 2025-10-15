const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔧 Testing Server Directly...\n');

// Create a test Express app
const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return testHomepageRoute();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function testHomepageRoute() {
  try {
    console.log('🏠 Testing homepage route...');
    
    // Simulate the homepage route logic
    const featuredMovies = await Movie.find().sort({ date: 1 }).limit(3);
    const featuredPlays = await StagePlays.find().sort({ date: 1 }).limit(3);
    const featuredOrchestra = await LiveOrchestra.find().sort({ date: 1 }).limit(3);
    
    const allFeatured = [...featuredMovies, ...featuredPlays, ...featuredOrchestra];
    const shuffledFeatured = allFeatured.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    console.log(`✅ Found ${shuffledFeatured.length} featured events`);
    
    // Test rendering
    const testData = {
      title: 'CursedTicket - Premium Entertainment',
      user: null,
      featuredEvents: shuffledFeatured
    };
    
    console.log('🎨 Testing template rendering...');
    app.render('index', testData, (err, rendered) => {
      if (err) {
        console.error('❌ Template rendering failed:', err.message);
        return;
      }
      console.log('✅ Template rendered successfully');
      console.log(`📊 Rendered size: ${rendered.length} characters`);
    });
    
    console.log('\n🎉 Server test completed successfully!');
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}
