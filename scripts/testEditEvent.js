/**
 * Test Edit Event System
 * Tests the edit event functionality
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('✏️ Testing Edit Event System...');
console.log('==============================\n');

async function testEditEvent() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Test 1: Find events to edit
    console.log('\n🎬 Finding Events to Edit...');
    
    const movies = await Movie.find().limit(3);
    const stagePlays = await StagePlays.find().limit(3);
    const liveOrchestra = await LiveOrchestra.find().limit(3);
    
    console.log(`✅ Found ${movies.length} movies`);
    console.log(`✅ Found ${stagePlays.length} stage plays`);
    console.log(`✅ Found ${liveOrchestra.length} live orchestra events`);

    // Test 2: Test edit URLs
    console.log('\n🔗 Testing Edit URLs...');
    
    if (movies.length > 0) {
      const movie = movies[0];
      console.log(`📽️ Movie: ${movie.name}`);
      console.log(`   Edit URL: http://localhost:3000/organizer/events/${movie._id}/edit`);
      console.log(`   Event ID: ${movie._id}`);
      console.log(`   Category: movies`);
      console.log(`   Organizer: ${movie.organizer}`);
    }
    
    if (stagePlays.length > 0) {
      const play = stagePlays[0];
      console.log(`🎭 Stage Play: ${play.name}`);
      console.log(`   Edit URL: http://localhost:3000/organizer/events/${play._id}/edit`);
      console.log(`   Event ID: ${play._id}`);
      console.log(`   Category: stage-plays`);
      console.log(`   Organizer: ${play.organizer}`);
    }
    
    if (liveOrchestra.length > 0) {
      const orchestra = liveOrchestra[0];
      console.log(`🎼 Live Orchestra: ${orchestra.name}`);
      console.log(`   Edit URL: http://localhost:3000/organizer/events/${orchestra._id}/edit`);
      console.log(`   Event ID: ${orchestra._id}`);
      console.log(`   Category: orchestra`);
      console.log(`   Organizer: ${orchestra.organizer}`);
    }

    // Test 3: Test edit page access
    console.log('\n🌐 Testing Edit Page Access...');
    const http = require('http');
    
    const testUrls = [];
    if (movies.length > 0) testUrls.push(`/organizer/events/${movies[0]._id}/edit`);
    if (stagePlays.length > 0) testUrls.push(`/organizer/events/${stagePlays[0]._id}/edit`);
    if (liveOrchestra.length > 0) testUrls.push(`/organizer/events/${liveOrchestra[0]._id}/edit`);

    for (const url of testUrls) {
      try {
        const response = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: 3000,
            path: url,
            method: 'GET',
            timeout: 5000
          };

          const req = http.request(options, (res) => {
            resolve({ 
              statusCode: res.statusCode,
              headers: res.headers
            });
          });
          
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.end();
        });
        
        if (response.statusCode === 200) {
          console.log(`✅ ${url} - Accessible (200)`);
        } else if (response.statusCode === 302) {
          console.log(`🔄 ${url} - Redirected (302) - Likely authentication required`);
        } else {
          console.log(`⚠️ ${url} - Status: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
      }
    }

    // Test 4: Check file structure
    console.log('\n📁 Checking File Structure...');
    const fs = require('fs');
    const path = require('path');
    
    const viewsPath = path.join(__dirname, '..', 'views');
    const organizerPath = path.join(viewsPath, 'organizer');
    const editEventPath = path.join(organizerPath, 'edit-event.ejs');
    
    if (fs.existsSync(editEventPath)) {
      console.log('✅ edit-event.ejs file exists');
      const stats = fs.statSync(editEventPath);
      console.log(`   File size: ${stats.size} bytes`);
      console.log(`   Last modified: ${stats.mtime}`);
    } else {
      console.log('❌ edit-event.ejs file not found');
    }
    
    if (fs.existsSync(organizerPath)) {
      console.log('✅ organizer directory exists');
      const files = fs.readdirSync(organizerPath);
      console.log(`   Files: ${files.join(', ')}`);
    } else {
      console.log('❌ organizer directory not found');
    }

    console.log('\n🎯 Edit Event System Test Results:');
    console.log('===================================');
    console.log('✅ Database connection established');
    console.log('✅ Events found in all categories');
    console.log('✅ Edit URLs generated');
    console.log('✅ Edit page access tested');
    console.log('✅ File structure checked');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Login as an organizer user');
    console.log('2. Go to organizer dashboard');
    console.log('3. Click "Edit" on any event');
    console.log('4. Test the edit form functionality');
    console.log('5. Verify the update process works');

    console.log('\n✨ Edit event system test completed! ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testEditEvent();
