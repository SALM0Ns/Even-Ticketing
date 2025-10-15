require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cloudinary configuration - You need to set these in your environment
// Or replace with your actual credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

console.log('☁️  Cloudinary Upload Script for CursedTicket');
console.log('📝 Note: You need to set up Cloudinary credentials first!');
console.log('🔗 Sign up at: https://cloudinary.com/console\n');

// Upload options
const uploadOptions = {
  poster: {
    folder: 'cursed-ticket/posters',
    transformation: [
      { width: 300, height: 450, crop: 'fill', quality: 'auto' }
    ]
  },
  wallpaper: {
    folder: 'cursed-ticket/wallpapers', 
    transformation: [
      { width: 1920, height: 1080, crop: 'fill', quality: 'auto' }
    ]
  }
};

// Function to upload image
async function uploadImage(imagePath, type, eventName) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ File not found: ${imagePath}`);
      return null;
    }

    const options = uploadOptions[type];
    const publicId = `cursed-ticket/${type}/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    const result = await cloudinary.uploader.upload(imagePath, {
      ...options,
      public_id: publicId,
      overwrite: true
    });
    
    console.log(`✅ Uploaded ${type}: ${eventName}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}\n`);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      cloudId: result.public_id,
      publicUrl: result.secure_url
    };
  } catch (error) {
    console.error(`❌ Error uploading ${type} for ${eventName}:`, error.message);
    return null;
  }
}

// Main upload function
async function uploadAllImages() {
  console.log('🚀 Starting image upload to Cloudinary...\n');
  
  // Define all events and their image paths
  const events = [
    // Movies
    {
      name: 'Oppenheimer',
      poster: 'public/images/oppenheimer-poster.jpg',
      wallpaper: 'public/images/oppenheimer-wallpaper.jpg'
    },
    {
      name: 'Dune',
      poster: 'public/images/dune-poster.jpg',
      wallpaper: 'public/images/dune-wallpaper.jpg'
    },
    {
      name: 'Kill Bill',
      poster: 'public/images/killbill-poster.jpg',
      wallpaper: 'public/images/killbill-wallpaper.jpg'
    },
    {
      name: 'Inception',
      poster: 'public/images/inception-poster.jpg',
      wallpaper: 'public/images/inception-wallpaper.jpg'
    },
    // Stage Plays
    {
      name: 'Phantom of the Opera',
      poster: 'public/images/phantom-poster.jpg',
      wallpaper: 'public/images/phantom-wallpaper.png'
    },
    {
      name: 'Hamilton',
      poster: 'public/images/hamilton-poster.jpg',
      wallpaper: 'public/images/hamilton-wallpaper.png'
    },
    {
      name: 'Lion King',
      poster: 'public/images/lionking-poster.jpg',
      wallpaper: 'public/images/lionking-wallpaper.jpg'
    },
    // Live Orchestra
    {
      name: 'Chopin Piano Concerto',
      poster: 'public/images/chopin-poster.jpg',
      wallpaper: 'public/images/chopin-wallpaper.png'
    },
    {
      name: 'Beethoven Symphony',
      poster: 'public/images/beethoven-poster.jpg',
      wallpaper: 'public/images/beethoven-wallpaper.png'
    },
    {
      name: 'Mozart Requiem',
      poster: 'public/images/mozart-poster.jpg',
      wallpaper: 'public/images/mozart-wallpaper.png'
    },
    {
      name: 'Swan Lake',
      poster: 'public/images/swan-lake-poster.jpg',
      wallpaper: 'public/images/swan-lake-wallpaper.jpg'
    }
  ];

  const uploadResults = [];

  for (const event of events) {
    console.log(`📤 Uploading images for: ${event.name}`);
    
    // Upload poster
    const posterResult = await uploadImage(event.poster, 'poster', event.name);
    if (posterResult) {
      uploadResults.push({
        eventName: event.name,
        type: 'poster',
        ...posterResult
      });
    }
    
    // Upload wallpaper
    const wallpaperResult = await uploadImage(event.wallpaper, 'wallpaper', event.name);
    if (wallpaperResult) {
      uploadResults.push({
        eventName: event.name,
        type: 'wallpaper',
        ...wallpaperResult
      });
    }
    
    console.log(''); // Empty line for readability
  }

  // Save results to file
  const resultsFile = 'scripts/cloudinary-upload-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(uploadResults, null, 2));
  
  console.log('🎉 Upload completed!');
  console.log(`📄 Results saved to: ${resultsFile}`);
  console.log(`📊 Total images uploaded: ${uploadResults.length}`);
  console.log('\n💡 Next steps:');
  console.log('1. Update your .env file with Cloudinary credentials');
  console.log('2. Run the database update script');
  console.log('3. Update frontend to use Cloudinary URLs');
}

// Check if credentials are set
if (process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name') {
  console.log('⚠️  Please set up your Cloudinary credentials first!');
  console.log('1. Sign up at https://cloudinary.com/console');
  console.log('2. Get your Cloud Name, API Key, and API Secret');
  console.log('3. Set them in your .env file or environment variables');
  console.log('4. Run this script again');
  process.exit(1);
}

// Run the upload
uploadAllImages().catch(console.error);
