/**
 * Fix 12 Angry Men Show Dates
 * Adds show dates and showtimes to 12 Angry Men event
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');

console.log('🔧 Fixing 12 Angry Men Show Dates...');
console.log('===================================\n');

async function fix12AngryMenShowDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    const eventId = '68f029af3657a769464e78f5';

    // Find the event
    console.log('\n🎬 Finding 12 Angry Men Event...');
    const event = await Movie.findById(eventId);
    if (!event) {
      console.log('❌ Event not found');
      return;
    }

    console.log(`✅ Event found: ${event.name}`);
    console.log(`   Current date: ${event.date}`);
    console.log(`   Current show dates: ${event.showDates ? event.showDates.length : 0}`);
    console.log(`   Current showtimes: ${event.showtimes ? event.showtimes.length : 0}`);

    // Create show dates (7 days from the event date)
    console.log('\n📅 Creating show dates...');
    const baseDate = new Date(event.date);
    const showDates = [];
    
    for (let i = 0; i < 7; i++) {
      const showDate = new Date(baseDate);
      showDate.setDate(baseDate.getDate() + i);
      showDates.push(showDate);
    }

    // Create showtimes (3 times per day)
    console.log('⏰ Creating showtimes...');
    const showtimes = [
      { time: '14:00', availableSeats: 200, totalSeats: 200 },
      { time: '17:30', availableSeats: 200, totalSeats: 200 },
      { time: '21:00', availableSeats: 200, totalSeats: 200 }
    ];

    // Update the event
    console.log('\n🔧 Updating event with show dates and showtimes...');
    await Movie.findByIdAndUpdate(eventId, {
      showDates: showDates,
      showtimes: showtimes
    });

    console.log('✅ Updated event with show dates and showtimes');

    // Verify the update
    console.log('\n✅ Verifying the update...');
    const updatedEvent = await Movie.findById(eventId);
    console.log(`Updated show dates: ${updatedEvent.showDates.length} dates`);
    console.log(`Updated showtimes: ${updatedEvent.showtimes.length} times`);
    
    console.log('\n📅 Show Dates:');
    updatedEvent.showDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
    });
    
    console.log('\n⏰ Showtimes:');
    updatedEvent.showtimes.forEach((time, index) => {
      console.log(`   ${index + 1}. ${time.time} (${time.availableSeats}/${time.totalSeats} seats)`);
    });

    // Test the event URL
    console.log('\n🌐 Event URL:');
    console.log(`http://localhost:3000/events/movies/${eventId}`);

    console.log('\n🎯 Fix Results:');
    console.log('===============');
    console.log('✅ Show dates added successfully');
    console.log('✅ Showtimes added successfully');
    console.log('✅ Event is ready for seat selection');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Go to the event page');
    console.log('2. Scroll down to "Select Your Seats" section');
    console.log('3. You should now see show dates to select');
    console.log('4. After selecting a date, you can choose seats');

    console.log('\n✨ Show dates fix completed! ✨');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fix12AngryMenShowDates();
