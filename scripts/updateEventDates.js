const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📅 Updating Event Dates for Countdown Timer...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return updateEventDates();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function updateEventDates() {
  try {
    const now = new Date();
    
    // Update Movies - set dates 1-4 weeks in the future
    console.log('📽️  Updating Movie dates...');
    const movies = await Movie.find({});
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      const futureDate = new Date(now.getTime() + (7 + i * 7) * 24 * 60 * 60 * 1000); // 1-4 weeks from now
      futureDate.setHours(19, 0, 0, 0); // Set to 7:00 PM
      
      await Movie.findByIdAndUpdate(movie._id, { date: futureDate });
      console.log(`   ✅ ${movie.name}: ${futureDate.toLocaleDateString()}`);
    }

    // Update Stage Plays - set dates 2-5 weeks in the future
    console.log('\n🎭 Updating Stage Play dates...');
    const stagePlays = await StagePlays.find({});
    for (let i = 0; i < stagePlays.length; i++) {
      const play = stagePlays[i];
      const futureDate = new Date(now.getTime() + (14 + i * 7) * 24 * 60 * 60 * 1000); // 2-5 weeks from now
      futureDate.setHours(19, 30, 0, 0); // Set to 7:30 PM
      
      await StagePlays.findByIdAndUpdate(play._id, { date: futureDate });
      console.log(`   ✅ ${play.name}: ${futureDate.toLocaleDateString()}`);
    }

    // Update Orchestra - set dates 3-6 weeks in the future
    console.log('\n🎼 Updating Orchestra dates...');
    const orchestra = await LiveOrchestra.find({});
    for (let i = 0; i < orchestra.length; i++) {
      const concert = orchestra[i];
      const futureDate = new Date(now.getTime() + (21 + i * 7) * 24 * 60 * 60 * 1000); // 3-6 weeks from now
      futureDate.setHours(20, 0, 0, 0); // Set to 8:00 PM
      
      await LiveOrchestra.findByIdAndUpdate(concert._id, { date: futureDate });
      console.log(`   ✅ ${concert.name}: ${futureDate.toLocaleDateString()}`);
    }

    console.log('\n🎉 Event dates updated successfully!');
    console.log('\n⏰ Countdown Timer will now show:');
    console.log('   📽️  Movies: 1-4 weeks countdown');
    console.log('   🎭 Stage Plays: 2-5 weeks countdown');
    console.log('   🎼 Orchestra: 3-6 weeks countdown');
    console.log('\n💡 Visit any event detail page to see the countdown timer in action!');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
