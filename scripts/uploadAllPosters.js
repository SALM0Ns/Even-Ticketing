const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0';

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Poster folder path
const POSTER_FOLDER = '/Users/salmonm/Documents/Works/4th Year/WEB/FInals Project/Poster';

async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'cursed-tickets',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.message);
    return null;
  }
}

async function uploadAllPosters() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Upload Movie Posters
    console.log('\n🎬 Uploading Movie Posters...');
    const movies = await Movie.find();
    
    for (const movie of movies) {
      const movieFolder = path.join(POSTER_FOLDER, 'Movie', movie.name);
      
      if (fs.existsSync(movieFolder)) {
        const posterFile = path.join(movieFolder, 'Poster.jpg');
        const wallpaperFile = path.join(movieFolder, 'Wallpaper.jpg');
        
        if (fs.existsSync(posterFile)) {
          const posterUrl = await uploadImage(posterFile, `movies/${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster`);
          if (posterUrl) {
            movie.poster = posterUrl;
            console.log(`✅ Uploaded poster for ${movie.name}`);
          }
        }
        
        if (fs.existsSync(wallpaperFile)) {
          const wallpaperUrl = await uploadImage(wallpaperFile, `movies/${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper`);
          if (wallpaperUrl) {
            movie.wallpaper = wallpaperUrl;
            console.log(`✅ Uploaded wallpaper for ${movie.name}`);
          }
        }
        
        await movie.save();
      } else {
        console.log(`⚠️  Folder not found for ${movie.name}`);
      }
    }

    // Upload Stage Play Posters
    console.log('\n🎭 Uploading Stage Play Posters...');
    const plays = await StagePlays.find();
    
    for (const play of plays) {
      const playFolder = path.join(POSTER_FOLDER, 'Stage Play', play.name);
      
      if (fs.existsSync(playFolder)) {
        const posterFile = path.join(playFolder, 'poster.jpg');
        const wallpaperFile = path.join(playFolder, 'Wallpaper.png');
        
        if (fs.existsSync(posterFile)) {
          const posterUrl = await uploadImage(posterFile, `stage-plays/${play.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster`);
          if (posterUrl) {
            play.poster = posterUrl;
            console.log(`✅ Uploaded poster for ${play.name}`);
          }
        }
        
        if (fs.existsSync(wallpaperFile)) {
          const wallpaperUrl = await uploadImage(wallpaperFile, `stage-plays/${play.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper`);
          if (wallpaperUrl) {
            play.wallpaper = wallpaperUrl;
            console.log(`✅ Uploaded wallpaper for ${play.name}`);
          }
        }
        
        await play.save();
      } else {
        console.log(`⚠️  Folder not found for ${play.name}`);
      }
    }

    // Upload Live Orchestra Posters
    console.log('\n🎼 Uploading Live Orchestra Posters...');
    const orchestra = await LiveOrchestra.find();
    
    for (const concert of orchestra) {
      const concertFolder = path.join(POSTER_FOLDER, 'Live Ochestra', concert.name);
      
      if (fs.existsSync(concertFolder)) {
        const posterFile = path.join(concertFolder, 'Poster.jpg');
        const wallpaperFile = path.join(concertFolder, 'Wallpaper.png');
        
        if (fs.existsSync(posterFile)) {
          const posterUrl = await uploadImage(posterFile, `orchestra/${concert.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster`);
          if (posterUrl) {
            concert.poster = posterUrl;
            console.log(`✅ Uploaded poster for ${concert.name}`);
          }
        }
        
        if (fs.existsSync(wallpaperFile)) {
          const wallpaperUrl = await uploadImage(wallpaperFile, `orchestra/${concert.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper`);
          if (wallpaperUrl) {
            concert.wallpaper = wallpaperUrl;
            console.log(`✅ Uploaded wallpaper for ${concert.name}`);
          }
        }
        
        await concert.save();
      } else {
        console.log(`⚠️  Folder not found for ${concert.name}`);
      }
    }

    console.log('\n🎉 All posters uploaded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadAllPosters();
