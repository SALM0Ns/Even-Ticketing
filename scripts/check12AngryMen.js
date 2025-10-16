/**
 * Check 12 Angry Men Event and User ID Issues
 * Investigates the missing user ID problem for 12 Angry Men event
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
const User = require('../models/User');

console.log('🔍 Checking 12 Angry Men Event and User ID Issues...');
console.log('==================================================\n');

async function check12AngryMen() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Search for 12 Angry Men in all collections
    console.log('\n🎬 Searching for "12 Angry Men" in all collections...');
    
    const searchTerm = '12 Angry Men';
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Search in Movies
    console.log('\n📽️ Searching in Movies...');
    const movies = await Movie.find({ name: searchRegex });
    if (movies.length > 0) {
      console.log(`✅ Found ${movies.length} movie(s) matching "12 Angry Men"`);
      movies.forEach((movie, index) => {
        console.log(`\n   Movie ${index + 1}:`);
        console.log(`   ID: ${movie._id}`);
        console.log(`   Name: ${movie.name}`);
        console.log(`   Organizer ID: ${movie.organizer}`);
        console.log(`   Date: ${movie.date}`);
        console.log(`   Status: ${movie.status}`);
        
        // Check if organizer exists
        if (movie.organizer) {
          User.findById(movie.organizer).then(user => {
            if (user) {
              console.log(`   Organizer: ${user.name} (${user.email})`);
            } else {
              console.log(`   ❌ Organizer not found! ID: ${movie.organizer}`);
            }
          }).catch(err => {
            console.log(`   ❌ Error finding organizer: ${err.message}`);
          });
        } else {
          console.log(`   ❌ No organizer ID found!`);
        }
      });
    } else {
      console.log('❌ No movies found matching "12 Angry Men"');
    }
    
    // Search in Stage Plays
    console.log('\n🎭 Searching in Stage Plays...');
    const stagePlays = await StagePlays.find({ name: searchRegex });
    if (stagePlays.length > 0) {
      console.log(`✅ Found ${stagePlays.length} stage play(s) matching "12 Angry Men"`);
      stagePlays.forEach((play, index) => {
        console.log(`\n   Stage Play ${index + 1}:`);
        console.log(`   ID: ${play._id}`);
        console.log(`   Name: ${play.name}`);
        console.log(`   Organizer ID: ${play.organizer}`);
        console.log(`   Date: ${play.date}`);
        console.log(`   Status: ${play.status}`);
        
        // Check if organizer exists
        if (play.organizer) {
          User.findById(play.organizer).then(user => {
            if (user) {
              console.log(`   Organizer: ${user.name} (${user.email})`);
            } else {
              console.log(`   ❌ Organizer not found! ID: ${play.organizer}`);
            }
          }).catch(err => {
            console.log(`   ❌ Error finding organizer: ${err.message}`);
          });
        } else {
          console.log(`   ❌ No organizer ID found!`);
        }
      });
    } else {
      console.log('❌ No stage plays found matching "12 Angry Men"');
    }
    
    // Search in Live Orchestra
    console.log('\n🎼 Searching in Live Orchestra...');
    const orchestra = await LiveOrchestra.find({ name: searchRegex });
    if (orchestra.length > 0) {
      console.log(`✅ Found ${orchestra.length} orchestra event(s) matching "12 Angry Men"`);
      orchestra.forEach((event, index) => {
        console.log(`\n   Orchestra Event ${index + 1}:`);
        console.log(`   ID: ${event._id}`);
        console.log(`   Name: ${event.name}`);
        console.log(`   Organizer ID: ${event.organizer}`);
        console.log(`   Date: ${event.date}`);
        console.log(`   Status: ${event.status}`);
        
        // Check if organizer exists
        if (event.organizer) {
          User.findById(event.organizer).then(user => {
            if (user) {
              console.log(`   Organizer: ${user.name} (${user.email})`);
            } else {
              console.log(`   ❌ Organizer not found! ID: ${event.organizer}`);
            }
          }).catch(err => {
            console.log(`   ❌ Error finding organizer: ${err.message}`);
          });
        } else {
          console.log(`   ❌ No organizer ID found!`);
        }
      });
    } else {
      console.log('❌ No orchestra events found matching "12 Angry Men"');
    }

    // Search for partial matches
    console.log('\n🔍 Searching for partial matches...');
    const partialRegex = new RegExp('angry|men', 'i');
    
    const partialMovies = await Movie.find({ name: partialRegex });
    const partialPlays = await StagePlays.find({ name: partialRegex });
    const partialOrchestra = await LiveOrchestra.find({ name: partialRegex });
    
    if (partialMovies.length > 0 || partialPlays.length > 0 || partialOrchestra.length > 0) {
      console.log('📋 Found partial matches:');
      
      if (partialMovies.length > 0) {
        console.log('\n📽️ Movies with partial match:');
        partialMovies.forEach(movie => {
          console.log(`   ${movie._id} - ${movie.name} (Organizer: ${movie.organizer})`);
        });
      }
      
      if (partialPlays.length > 0) {
        console.log('\n🎭 Stage Plays with partial match:');
        partialPlays.forEach(play => {
          console.log(`   ${play._id} - ${play.name} (Organizer: ${play.organizer})`);
        });
      }
      
      if (partialOrchestra.length > 0) {
        console.log('\n🎼 Orchestra Events with partial match:');
        partialOrchestra.forEach(event => {
          console.log(`   ${event._id} - ${event.name} (Organizer: ${event.organizer})`);
        });
      }
    } else {
      console.log('❌ No partial matches found');
    }

    // Check all events for missing organizer IDs
    console.log('\n🔍 Checking all events for missing organizer IDs...');
    
    const allMovies = await Movie.find({});
    const allPlays = await StagePlays.find({});
    const allOrchestra = await LiveOrchestra.find({});
    
    let missingOrganizerCount = 0;
    
    console.log('\n📽️ Movies with missing organizer IDs:');
    allMovies.forEach(movie => {
      if (!movie.organizer) {
        console.log(`   ❌ ${movie._id} - ${movie.name} (No organizer ID)`);
        missingOrganizerCount++;
      }
    });
    
    console.log('\n🎭 Stage Plays with missing organizer IDs:');
    allPlays.forEach(play => {
      if (!play.organizer) {
        console.log(`   ❌ ${play._id} - ${play.name} (No organizer ID)`);
        missingOrganizerCount++;
      }
    });
    
    console.log('\n🎼 Orchestra Events with missing organizer IDs:');
    allOrchestra.forEach(event => {
      if (!event.organizer) {
        console.log(`   ❌ ${event._id} - ${event.name} (No organizer ID)`);
        missingOrganizerCount++;
      }
    });
    
    if (missingOrganizerCount === 0) {
      console.log('✅ All events have organizer IDs');
    } else {
      console.log(`\n⚠️ Found ${missingOrganizerCount} events with missing organizer IDs`);
    }

    // List all available events
    console.log('\n📋 All Available Events:');
    console.log('\n📽️ Movies:');
    allMovies.forEach(movie => {
      console.log(`   ${movie._id} - ${movie.name} (Organizer: ${movie.organizer || 'MISSING'})`);
    });
    
    console.log('\n🎭 Stage Plays:');
    allPlays.forEach(play => {
      console.log(`   ${play._id} - ${play.name} (Organizer: ${play.organizer || 'MISSING'})`);
    });
    
    console.log('\n🎼 Live Orchestra:');
    allOrchestra.forEach(event => {
      console.log(`   ${event._id} - ${event.name} (Organizer: ${event.organizer || 'MISSING'})`);
    });

    console.log('\n🎯 12 Angry Men Investigation Results:');
    console.log('=====================================');
    console.log(`✅ Database connection established`);
    console.log(`✅ Searched all collections for "12 Angry Men"`);
    console.log(`✅ Checked for partial matches`);
    console.log(`✅ Verified organizer IDs`);
    console.log(`✅ Listed all available events`);

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. If "12 Angry Men" is not found, it may have been deleted');
    console.log('2. If found but missing organizer ID, we need to fix it');
    console.log('3. If organizer ID exists but user is missing, we need to create the user');
    console.log('4. Check if the event was moved to a different collection');

    console.log('\n✨ 12 Angry Men investigation completed! ✨');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

check12AngryMen();
