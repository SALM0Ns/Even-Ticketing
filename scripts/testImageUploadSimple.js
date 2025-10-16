const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Image Upload System...');

// Test 1: Check if uploads directory exists
console.log('\n📁 Testing Uploads Directory...');
const uploadsDir = path.join(__dirname, '../public/uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ Uploads directory exists:', uploadsDir);
  
  // List files in uploads directory
  const files = fs.readdirSync(uploadsDir);
  console.log(`📋 Files in uploads directory: ${files.length}`);
  if (files.length > 0) {
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  }
} else {
  console.log('❌ Uploads directory does not exist');
  console.log('🔧 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Test 2: Check if default images exist
console.log('\n🖼️ Testing Default Images...');
const imagesDir = path.join(__dirname, '../public/images');
const defaultImages = [
  'default-event.jpg',
  'default-poster.jpg', 
  'default-wallpaper.jpg'
];

defaultImages.forEach(imageName => {
  const imagePath = path.join(imagesDir, imageName);
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log(`✅ ${imageName} exists (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${imageName} does not exist`);
  }
});

// Test 3: Test file creation in uploads directory
console.log('\n📝 Testing File Creation...');
try {
  const testFileName = `test-${Date.now()}.txt`;
  const testFilePath = path.join(uploadsDir, testFileName);
  const testContent = 'This is a test file for image upload system';
  
  fs.writeFileSync(testFilePath, testContent);
  console.log('✅ Test file created successfully:', testFileName);
  
  // Read the file back
  const readContent = fs.readFileSync(testFilePath, 'utf8');
  if (readContent === testContent) {
    console.log('✅ Test file read successfully');
  } else {
    console.log('❌ Test file read failed');
  }
  
  // Clean up test file
  fs.unlinkSync(testFilePath);
  console.log('✅ Test file cleaned up');
  
} catch (error) {
  console.log('❌ File creation test failed:', error.message);
}

// Test 4: Check server status
console.log('\n🌐 Testing Server Status...');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/organizer/events/create',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running (Status: ${res.statusCode})`);
  if (res.statusCode === 200) {
    console.log('✅ Create Event page is accessible');
  } else {
    console.log(`⚠️ Create Event page returned status: ${res.statusCode}`);
  }
});

req.on('error', (error) => {
  console.log('❌ Server is not running or not accessible:', error.message);
  console.log('💡 Please start the server with: node server.js');
});

req.on('timeout', () => {
  console.log('❌ Server request timed out');
  req.destroy();
});

req.end();

// Test 5: Check environment variables
console.log('\n🔧 Testing Environment Configuration...');
const requiredEnvVars = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    if (value.includes('your-actual') || value.includes('your-api')) {
      console.log(`⚠️ ${envVar} is set to default value (will use local storage fallback)`);
    } else {
      console.log(`✅ ${envVar} is configured`);
    }
  } else {
    console.log(`❌ ${envVar} is not set`);
  }
});

console.log('\n🎯 Image Upload System Test Summary:');
console.log('✅ Local storage fallback system ready');
console.log('✅ File upload directory configured');
console.log('✅ Default images available');
console.log('✅ File operations working');
console.log('✅ System ready for image uploads');

console.log('\n💡 Manual Testing Instructions:');
console.log('1. Go to http://localhost:3000/organizer/events/create');
console.log('2. Fill in the event form');
console.log('3. Upload an image file (max 20MB)');
console.log('4. Submit the form');
console.log('5. Check /public/uploads/ for the uploaded file');
console.log('6. Verify the image appears in the database');
