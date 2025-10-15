require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('☁️  Testing Cloudinary Setup...\n');

// Test configuration
console.log('🔧 Configuration Check:');
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET'}`);
console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'}\n`);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Test connection
async function testCloudinaryConnection() {
  try {
    console.log('🔗 Testing Cloudinary connection...');
    
    // Try to get account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log(`   Status: ${result.status}\n`);
    
    // Test upload with a small image
    console.log('📤 Testing image upload...');
    const uploadResult = await cloudinary.uploader.upload('public/images/dune-poster.jpg', {
      folder: 'cursed-ticket/test',
      public_id: 'test-upload',
      overwrite: true
    });
    
    console.log('✅ Test upload successful!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   Size: ${(uploadResult.bytes / 1024).toFixed(2)} KB\n`);
    
    // Test optimized URL
    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      width: 300,
      height: 450,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    });
    
    console.log('🎯 Optimized URL example:');
    console.log(`   ${optimizedUrl}\n`);
    
    // Clean up test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🧹 Test image cleaned up\n');
    
    console.log('🎉 Cloudinary setup is working perfectly!');
    console.log('💡 You can now run:');
    console.log('   1. node scripts/uploadToCloudinary.js');
    console.log('   2. node scripts/updateDatabaseWithCloudinary.js');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message || error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct credentials');
    console.log('2. Verify your Cloudinary account is active');
    console.log('3. Make sure you have internet connection');
    console.log('4. Check if the test image exists: public/images/dune-poster.jpg');
    console.log('5. Verify your Cloud Name is correct (case sensitive)');
  }
}

// Check if credentials are properly set
if (process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' || 
    !process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('⚠️  Cloudinary credentials not set!');
  console.log('\n📝 Setup instructions:');
  console.log('1. Sign up at https://cloudinary.com/console');
  console.log('2. Get your Cloud Name, API Key, and API Secret');
  console.log('3. Create a .env file with:');
  console.log('   CLOUDINARY_CLOUD_NAME=your-actual-cloud-name');
  console.log('   CLOUDINARY_API_KEY=your-actual-api-key');
  console.log('   CLOUDINARY_API_SECRET=your-actual-api-secret');
  console.log('4. Run this script again');
  process.exit(1);
}

// Run the test
testCloudinaryConnection();
