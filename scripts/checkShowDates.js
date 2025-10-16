/**
 * Check Show Dates for Events
 * Investigates why show dates are not loading
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📅 Checking Show Dates for Events...');
console.log('===================================\n');

async function checkShowDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Check 12 Angry Men specifically
    console.log('\n🎬 Checking 12 Angry Men Event...');
    const eventId = '68f029af3657a769464e78f5';
    const event = await Movie.findById(eventId);
    
    if (event) {
      console.log(`✅ Event found: ${event.name}`);
      console.log(`   Event ID: ${event._id}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Show Dates: ${JSON.stringify(event.showDates, null, 2)}`);
      console.log(`   Showtimes: ${JSON.stringify(event.showtimes, null, 2)}`);
      console.log(`   Performances: ${JSON.stringify(event.performances, null, 2)}`);
      
      // Check if showDates exists and has data
      if (event.showDates && event.showDates.length > 0) {
        console.log(`✅ Show dates found: ${event.showDates.length} dates`);
        event.showDates.forEach((date, index) => {
          console.log(`   Date ${index + 1}: ${date.date || date}`);
        });
      } else {
        console.log('❌ No show dates found');
        
        // Check if we have showtimes instead
        if (event.showtimes && event.showtimes.length > 0) {
          console.log(`✅ Showtimes found: ${event.showtimes.length} times`);
          event.showtimes.forEach((time, index) => {
            console.log(`   Time ${index + 1}: ${time.time}`);
          });
        } else {
          console.log('❌ No showtimes found either');
        }
      }
    } else {
      console.log('❌ Event not found');
    }

    // Check all movies for show dates
    console.log('\n📽️ Checking All Movies for Show Dates...');
    const allMovies = await Movie.find({});
    
    allMovies.forEach((movie, index) => {
      console.log(`\nMovie ${index + 1}: ${movie.name}`);
      console.log(`   ID: ${movie._id}`);
      console.log(`   Date: ${movie.date}`);
      console.log(`   Show Dates: ${movie.showDates ? movie.showDates.length : 0} dates`);
      console.log(`   Showtimes: ${movie.showtimes ? movie.showtimes.length : 0} times`);
      console.log(`   Performances: ${movie.performances ? movie.performances.length : 0} performances`);
      
      if (movie.showDates && movie.showDates.length > 0) {
        console.log('   Show Dates Details:');
        movie.showDates.forEach((date, i) => {
          console.log(`     ${i + 1}. ${date.date || date}`);
        });
      }
      
      if (movie.showtimes && movie.showtimes.length > 0) {
        console.log('   Showtimes Details:');
        movie.showtimes.forEach((time, i) => {
          console.log(`     ${i + 1}. ${time.time}`);
        });
      }
    });

    // Check stage plays
    console.log('\n🎭 Checking Stage Plays for Show Dates...');
    const allPlays = await StagePlays.find({});
    
    allPlays.forEach((play, index) => {
      console.log(`\nStage Play ${index + 1}: ${play.name}`);
      console.log(`   ID: ${play._id}`);
      console.log(`   Date: ${play.date}`);
      console.log(`   Show Dates: ${play.showDates ? play.showDates.length : 0} dates`);
      console.log(`   Showtimes: ${play.showtimes ? play.showtimes.length : 0} times`);
      console.log(`   Performances: ${play.performances ? play.performances.length : 0} performances`);
    });

    // Check live orchestra
    console.log('\n🎼 Checking Live Orchestra for Show Dates...');
    const allOrchestra = await LiveOrchestra.find({});
    
    allOrchestra.forEach((concert, index) => {
      console.log(`\nOrchestra ${index + 1}: ${concert.name}`);
      console.log(`   ID: ${concert._id}`);
      console.log(`   Date: ${concert.date}`);
      console.log(`   Show Dates: ${concert.showDates ? concert.showDates.length : 0} dates`);
      console.log(`   Showtimes: ${concert.showtimes ? concert.showtimes.length : 0} times`);
      console.log(`   Performances: ${concert.performances ? concert.performances.length : 0} performances`);
    });

    console.log('\n🎯 Show Dates Investigation Results:');
    console.log('====================================');
    console.log('✅ Database connection established');
    console.log('✅ Checked 12 Angry Men event');
    console.log('✅ Checked all movies for show dates');
    console.log('✅ Checked all stage plays for show dates');
    console.log('✅ Checked all live orchestra for show dates');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. If no show dates found, we need to add them');
    console.log('2. If showtimes exist but not showDates, we need to convert them');
    console.log('3. If neither exists, we need to create default show dates');
    console.log('4. Check the frontend JavaScript for proper data handling');

    console.log('\n✨ Show dates investigation completed! ✨');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkShowDates();