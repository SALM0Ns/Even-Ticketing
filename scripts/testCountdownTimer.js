const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('⏰ Testing Countdown Timer Data...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return testCountdownData();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function testCountdownData() {
  try {
    console.log('📽️  Testing Movie dates...');
    const movies = await Movie.find({});
    
    movies.forEach(movie => {
      const eventDate = new Date(movie.date);
      const now = new Date();
      const timeDiff = eventDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`   ${movie.name}:`);
      console.log(`     Event Date: ${eventDate.toLocaleDateString()}`);
      console.log(`     Days Left: ${daysLeft > 0 ? daysLeft : 'Event has passed'}`);
      console.log(`     Status: ${timeDiff > 0 ? '⏰ Countdown Active' : '✅ Event Started'}`);
      console.log('');
    });

    console.log(' Testing Stage Play dates...');
    const stagePlays = await StagePlays.find({});
    
    stagePlays.forEach(play => {
      const eventDate = new Date(play.date);
      const now = new Date();
      const timeDiff = eventDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`   ${play.name}:`);
      console.log(`     Event Date: ${eventDate.toLocaleDateString()}`);
      console.log(`     Days Left: ${daysLeft > 0 ? daysLeft : 'Event has passed'}`);
      console.log(`     Status: ${timeDiff > 0 ? '⏰ Countdown Active' : '✅ Event Started'}`);
      console.log('');
    });

    console.log('🎼 Testing Orchestra dates...');
    const orchestra = await LiveOrchestra.find({});
    
    orchestra.forEach(concert => {
      const eventDate = new Date(concert.date);
      const now = new Date();
      const timeDiff = eventDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`   ${concert.name}:`);
      console.log(`     Event Date: ${eventDate.toLocaleDateString()}`);
      console.log(`     Days Left: ${daysLeft > 0 ? daysLeft : 'Event has passed'}`);
      console.log(`     Status: ${timeDiff > 0 ? '⏰ Countdown Active' : '✅ Event Started'}`);
      console.log('');
    });

    console.log('🎉 Countdown Timer test completed!');
    console.log('\n💡 Features:');
    console.log('   ⏰ Real-time countdown (days, hours, minutes, seconds)');
    console.log('   🎨 Beautiful animated cards with different colors');
    console.log('   📱 Responsive design for all devices');
    console.log('   ⚡ Pulse animation when event is starting soon');
    console.log('   ✅ Shows "Event Has Started" when time is up');
    
  } catch (error) {
    console.error('❌ Countdown test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
