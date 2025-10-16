const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0';

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Poster folder path
const POSTER_FOLDER = '/Users/salmonm/Documents/Works/4th Year/WEB/FInals Project/Poster';
const PUBLIC_IMAGES = '/Users/salmonm/Documents/Works/4th Year/WEB/Even-Ticketing-New/public/images';

function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error copying ${source}:`, error.message);
    return false;
  }
}

async function copyAllPosters() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Copy Movie Posters
    console.log('\n🎬 Copying Movie Posters...');
    const movies = await Movie.find();
    
    for (const movie of movies) {
      console.log(`Processing: ${movie.name}`);
      
      // Try different folder name variations
      const possibleFolders = [
        path.join(POSTER_FOLDER, 'Movie', movie.name),
        path.join(POSTER_FOLDER, 'Movie', 'Dune '), // Dune has space at end
        path.join(POSTER_FOLDER, 'Movie', 'Poppenheimer'), // Typo in folder name
        path.join(POSTER_FOLDER, 'Movie', 'Inception'),
        path.join(POSTER_FOLDER, 'Movie', 'Kill Bill')
      ];
      
      let foundFolder = null;
      for (const folder of possibleFolders) {
        if (fs.existsSync(folder)) {
          foundFolder = folder;
          break;
        }
      }
      
      if (foundFolder) {
        console.log(`  Found folder: ${foundFolder}`);
        
        // Copy poster
        const posterSource = path.join(foundFolder, 'Poster.jpg');
        const posterDest = path.join(PUBLIC_IMAGES, `${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster.jpg`);
        
        if (copyFile(posterSource, posterDest)) {
          movie.poster = `/images/${path.basename(posterDest)}`;
          console.log(`  ✅ Copied poster: ${movie.poster}`);
        }
        
        // Copy wallpaper
        const wallpaperSource = path.join(foundFolder, 'Wallpaper.jpg');
        const wallpaperDest = path.join(PUBLIC_IMAGES, `${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper.jpg`);
        
        if (copyFile(wallpaperSource, wallpaperDest)) {
          movie.wallpaper = `/images/${path.basename(wallpaperDest)}`;
          console.log(`  ✅ Copied wallpaper: ${movie.wallpaper}`);
        }
        
        await movie.save();
      } else {
        console.log(`  ⚠️  No folder found for ${movie.name}`);
      }
    }

    // Copy Stage Play Posters
    console.log('\n🎭 Copying Stage Play Posters...');
    const plays = await StagePlays.find();
    
    for (const play of plays) {
      console.log(`Processing: ${play.name}`);
      
      const possibleFolders = [
        path.join(POSTER_FOLDER, 'Stage Play', play.name),
        path.join(POSTER_FOLDER, 'Stage Play', 'Phantom of the Opera'),
        path.join(POSTER_FOLDER, 'Stage Play', 'Hamilton'),
        path.join(POSTER_FOLDER, 'Stage Play', 'Lion King')
      ];
      
      let foundFolder = null;
      for (const folder of possibleFolders) {
        if (fs.existsSync(folder)) {
          foundFolder = folder;
          break;
        }
      }
      
      if (foundFolder) {
        console.log(`  Found folder: ${foundFolder}`);
        
        // Copy poster (note: some use lowercase 'poster.jpg')
        const posterSource = path.join(foundFolder, 'poster.jpg');
        const posterDest = path.join(PUBLIC_IMAGES, `${play.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster.jpg`);
        
        if (copyFile(posterSource, posterDest)) {
          play.poster = `/images/${path.basename(posterDest)}`;
          console.log(`  ✅ Copied poster: ${play.poster}`);
        }
        
        // Copy wallpaper
        const wallpaperSource = path.join(foundFolder, 'Wallpaper.png');
        const wallpaperDest = path.join(PUBLIC_IMAGES, `${play.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper.png`);
        
        if (copyFile(wallpaperSource, wallpaperDest)) {
          play.wallpaper = `/images/${path.basename(wallpaperDest)}`;
          console.log(`  ✅ Copied wallpaper: ${play.wallpaper}`);
        }
        
        await play.save();
      } else {
        console.log(`  ⚠️  No folder found for ${play.name}`);
      }
    }

    // Copy Live Orchestra Posters
    console.log('\n🎼 Copying Live Orchestra Posters...');
    const orchestra = await LiveOrchestra.find();
    
    for (const concert of orchestra) {
      console.log(`Processing: ${concert.name}`);
      
      const possibleFolders = [
        path.join(POSTER_FOLDER, 'Live Ochestra', concert.name),
        path.join(POSTER_FOLDER, 'Live Ochestra', 'Chopin Piano Concerto No. 1'),
        path.join(POSTER_FOLDER, 'Live Ochestra', 'Beethoven Symphony No. 9 \'Ode to Joy\''),
        path.join(POSTER_FOLDER, 'Live Ochestra', 'Mozart\'s Requiem'),
        path.join(POSTER_FOLDER, 'Live Ochestra', 'Tchaikovsky\'s Swan Lake')
      ];
      
      let foundFolder = null;
      for (const folder of possibleFolders) {
        if (fs.existsSync(folder)) {
          foundFolder = folder;
          break;
        }
      }
      
      if (foundFolder) {
        console.log(`  Found folder: ${foundFolder}`);
        
        // Copy poster
        const posterSource = path.join(foundFolder, 'Poster.jpg');
        const posterDest = path.join(PUBLIC_IMAGES, `${concert.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster.jpg`);
        
        if (copyFile(posterSource, posterDest)) {
          concert.poster = `/images/${path.basename(posterDest)}`;
          console.log(`  ✅ Copied poster: ${concert.poster}`);
        }
        
        // Copy wallpaper
        const wallpaperSource = path.join(foundFolder, 'Wallpaper.png');
        const wallpaperDest = path.join(PUBLIC_IMAGES, `${concert.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-wallpaper.png`);
        
        if (copyFile(wallpaperSource, wallpaperDest)) {
          concert.wallpaper = `/images/${path.basename(wallpaperDest)}`;
          console.log(`  ✅ Copied wallpaper: ${concert.wallpaper}`);
        }
        
        await concert.save();
      } else {
        console.log(`  ⚠️  No folder found for ${concert.name}`);
      }
    }

    console.log('\n🎉 All posters copied successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

copyAllPosters();
