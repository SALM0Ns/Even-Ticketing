const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('📥 Importing CursedTicket Database...\n');

// Friend's MongoDB connection string (update this!)
const FRIEND_MONGODB_URI = 'mongodb+srv://friend-user:password@cluster0.xxxxx.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0';

// Import file path
const importPath = path.join(__dirname, 'cursed-ticket-export.json');

// Check if import file exists
if (!fs.existsSync(importPath)) {
  console.error('❌ Import file not found!');
  console.log('📝 Please make sure cursed-ticket-export.json is in the scripts/ folder');
  process.exit(1);
}

// Connect to friend's database
mongoose.connect(FRIEND_MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to friend\'s MongoDB');
  return importDatabase();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.log('\n📝 Please update FRIEND_MONGODB_URI in this script with your connection string');
  process.exit(1);
});

async function importDatabase() {
  try {
    console.log('📄 Reading import file...');
    const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
    
    console.log(`📊 Import data: ${importData.totalEvents} events from ${importData.exportDate}`);

    console.log('\n📽️  Importing movies...');
    await Movie.deleteMany({});
    if (importData.movies && importData.movies.length > 0) {
      await Movie.insertMany(importData.movies);
      console.log(`✅ Imported ${importData.movies.length} movies`);
    }

    console.log('\n🎭 Importing stage plays...');
    await StagePlays.deleteMany({});
    if (importData.stagePlays && importData.stagePlays.length > 0) {
      await StagePlays.insertMany(importData.stagePlays);
      console.log(`✅ Imported ${importData.stagePlays.length} stage plays`);
    }

    console.log('\n🎼 Importing orchestra events...');
    await LiveOrchestra.deleteMany({});
    if (importData.orchestra && importData.orchestra.length > 0) {
      await LiveOrchestra.insertMany(importData.orchestra);
      console.log(`✅ Imported ${importData.orchestra.length} orchestra events`);
    }

    console.log('\n🎉 Database import completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with your MongoDB connection string');
    console.log('2. Update your .env file with your Cloudinary credentials');
    console.log('3. Run: npm start');
    console.log('4. Open: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
