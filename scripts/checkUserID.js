/**
 * Check User ID for 12 Angry Man Event
 * Verifies if the organizer user exists
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('👤 Checking User ID for 12 Angry Man Event...');
console.log('============================================\n');

async function checkUserID() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    const eventId = '68f029af3657a769464e78f5';
    const organizerId = '68f00d83d1330a3a67c06f03';

    // Check the event
    console.log('\n🎬 Checking 12 Angry Man Event...');
    const event = await Movie.findById(eventId);
    if (event) {
      console.log(`✅ Event found: ${event.name}`);
      console.log(`   Event ID: ${event._id}`);
      console.log(`   Organizer ID: ${event.organizer}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Status: ${event.status}`);
    } else {
      console.log('❌ Event not found');
      return;
    }

    // Check the organizer user
    console.log('\n👤 Checking Organizer User...');
    const organizer = await User.findById(organizerId);
    if (organizer) {
      console.log(`✅ Organizer found: ${organizer.name}`);
      console.log(`   User ID: ${organizer._id}`);
      console.log(`   Email: ${organizer.email}`);
      console.log(`   Role: ${organizer.role}`);
      console.log(`   Created: ${organizer.createdAt}`);
    } else {
      console.log(`❌ Organizer not found! ID: ${organizerId}`);
      
      // Check if there are any users with similar IDs
      console.log('\n🔍 Searching for similar user IDs...');
      const allUsers = await User.find({});
      console.log(`Found ${allUsers.length} users in database:`);
      allUsers.forEach(user => {
        console.log(`   ${user._id} - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Check if there are any events with missing organizers
    console.log('\n🔍 Checking for events with missing organizers...');
    const allMovies = await Movie.find({});
    const allPlays = await StagePlays.find({});
    const allOrchestra = await LiveOrchestra.find({});
    
    let missingOrganizerEvents = [];
    
    for (const movie of allMovies) {
      if (movie.organizer) {
        const user = await User.findById(movie.organizer);
        if (!user) {
          missingOrganizerEvents.push({
            type: 'Movie',
            id: movie._id,
            name: movie.name,
            organizerId: movie.organizer
          });
        }
      }
    }
    
    for (const play of allPlays) {
      if (play.organizer) {
        const user = await User.findById(play.organizer);
        if (!user) {
          missingOrganizerEvents.push({
            type: 'Stage Play',
            id: play._id,
            name: play.name,
            organizerId: play.organizer
          });
        }
      }
    }
    
    for (const event of allOrchestra) {
      if (event.organizer) {
        const user = await User.findById(event.organizer);
        if (!user) {
          missingOrganizerEvents.push({
            type: 'Live Orchestra',
            id: event._id,
            name: event.name,
            organizerId: event.organizer
          });
        }
      }
    }
    
    if (missingOrganizerEvents.length > 0) {
      console.log(`\n⚠️ Found ${missingOrganizerEvents.length} events with missing organizers:`);
      missingOrganizerEvents.forEach(event => {
        console.log(`   ${event.type}: ${event.name} (ID: ${event.id}) - Missing organizer: ${event.organizerId}`);
      });
    } else {
      console.log('✅ All events have valid organizers');
    }

    // Fix the 12 Angry Man event if needed
    if (!organizer) {
      console.log('\n🔧 Fixing 12 Angry Man Event...');
      
      // Find a valid organizer user
      const validOrganizer = await User.findOne({ role: 'organizer' });
      if (validOrganizer) {
        console.log(`Found valid organizer: ${validOrganizer.name} (${validOrganizer._id})`);
        
        // Update the event with the valid organizer
        await Movie.findByIdAndUpdate(eventId, { organizer: validOrganizer._id });
        console.log('✅ Updated 12 Angry Man event with valid organizer');
        
        // Verify the update
        const updatedEvent = await Movie.findById(eventId);
        console.log(`Updated event organizer: ${updatedEvent.organizer}`);
      } else {
        console.log('❌ No valid organizer found to fix the event');
      }
    }

    console.log('\n🎯 User ID Check Results:');
    console.log('=========================');
    console.log(`✅ Event: ${event ? 'Found' : 'Not Found'}`);
    console.log(`✅ Organizer: ${organizer ? 'Found' : 'Not Found'}`);
    console.log(`✅ Events with missing organizers: ${missingOrganizerEvents.length}`);

    console.log('\n💡 Summary:');
    console.log('===========');
    if (organizer) {
      console.log('✅ 12 Angry Man event has a valid organizer');
      console.log('✅ No action needed');
    } else {
      console.log('❌ 12 Angry Man event has a missing organizer');
      console.log('✅ Attempted to fix by assigning a valid organizer');
    }

    console.log('\n✨ User ID check completed! ✨');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUserID();
