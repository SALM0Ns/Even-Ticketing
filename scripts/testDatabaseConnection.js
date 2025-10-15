const mongoose = require('mongoose');

console.log('🔧 Testing Database Connection...\n');

// Connect to MongoDB
mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🔗 Host:', mongoose.connection.host);
  console.log('📝 Port:', mongoose.connection.port);
  
  // Test a simple query
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful!');
  console.log('🎉 Database connection is working perfectly!');
})
.catch(err => {
  console.error('❌ Database connection failed:', err.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your internet connection');
  console.log('2. Verify MongoDB Atlas credentials');
  console.log('3. Check if the database exists');
  console.log('4. Verify network access in MongoDB Atlas');
})
.finally(() => {
  mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
});
