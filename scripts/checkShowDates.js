const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🔍 Checking Show Dates in Database...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  return checkShowDates();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function checkShowDates() {
  try {
    console.log('📽️  Movies Show Dates:');
    const movies = await Movie.find({}, '_id name showDates');
    movies.forEach(movie => {
      console.log(`   ${movie.name}:`);
      console.log(`   ID: ${movie._id}`);
      console.log(`   Show Dates: ${movie.showDates ? movie.showDates.length : 0} dates`);
      if (movie.showDates && movie.showDates.length > 0) {
        movie.showDates.forEach((date, index) => {
          console.log(`     ${index + 1}. ${new Date(date.date || date).toLocaleString()}`);
        });
      } else {
        console.log('     No show dates found!');
      }
      console.log('');
    });

    console.log(' Stage Plays Show Dates:');
    const stagePlays = await StagePlays.find({}, '_id name showDates');
    stagePlays.forEach(play => {
      console.log(`   ${play.name}:`);
      console.log(`   ID: ${play._id}`);
      console.log(`   Show Dates: ${play.showDates ? play.showDates.length : 0} dates`);
      if (play.showDates && play.showDates.length > 0) {
        play.showDates.forEach((date, index) => {
          console.log(`     ${index + 1}. ${new Date(date.date || date).toLocaleString()}`);
        });
      } else {
        console.log('     No show dates found!');
      }
      console.log('');
    });

    console.log('🎼 Live Orchestra Show Dates:');
    const orchestraEvents = await LiveOrchestra.find({}, '_id name showDates');
    orchestraEvents.forEach(concert => {
      console.log(`   ${concert.name}:`);
      console.log(`   ID: ${concert._id}`);
      console.log(`   Show Dates: ${concert.showDates ? concert.showDates.length : 0} dates`);
      if (concert.showDates && concert.showDates.length > 0) {
        concert.showDates.forEach((date, index) => {
          console.log(`     ${index + 1}. ${new Date(date.date || date).toLocaleString()}`);
        });
      } else {
        console.log('     No show dates found!');
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
