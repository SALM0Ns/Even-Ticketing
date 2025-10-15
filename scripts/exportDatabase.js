const mongoose = require('mongoose');
const fs = require('fs');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📤 Exporting CursedTicket Database...\n');

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0';

// Connect to your database
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to your MongoDB');
  return exportDatabase();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function exportDatabase() {
  try {
    console.log('📽️  Exporting movies...');
    const movies = await Movie.find({});
    console.log(`✅ Exported ${movies.length} movies`);

    console.log('🎭 Exporting stage plays...');
    const stagePlays = await StagePlays.find({});
    console.log(`✅ Exported ${stagePlays.length} stage plays`);

    console.log('🎼 Exporting orchestra events...');
    const orchestra = await LiveOrchestra.find({});
    console.log(`✅ Exported ${orchestra.length} orchestra events`);

    // Create export data
    const exportData = {
      movies: movies,
      stagePlays: stagePlays,
      orchestra: orchestra,
      exportDate: new Date(),
      totalEvents: movies.length + stagePlays.length + orchestra.length
    };

    // Save to JSON file
    const exportPath = path.join(__dirname, 'cursed-ticket-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('\n🎉 Database export completed!');
    console.log(`📄 Export saved to: ${exportPath}`);
    console.log(`📊 Total events exported: ${exportData.totalEvents}`);
    
    console.log('\n📝 Share this file with your friend:');
    console.log('1. Send them the cursed-ticket-export.json file');
    console.log('2. They can run: node scripts/importDatabase.js');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
