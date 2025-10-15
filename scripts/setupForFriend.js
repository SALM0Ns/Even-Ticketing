const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

console.log('🎫 Setting up CursedTicket Database for Friend...\n');

// Friend's MongoDB connection string
const FRIEND_MONGODB_URI = 'mongodb+srv://friend-user:password@cluster0.xxxxx.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0';

// Connect to friend's database
mongoose.connect(FRIEND_MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Event'
})
.then(() => {
  console.log('✅ Connected to friend\'s MongoDB');
  return setupDatabase();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.log('\n📝 Please update FRIEND_MONGODB_URI in this script with your friend\'s connection string');
  process.exit(1);
});

async function setupDatabase() {
  try {
    console.log('📽️  Creating sample movies...');
    
    const movies = [
      {
        name: 'Dune',
        description: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
        date: new Date('2024-12-21'),
        location: {
          name: 'AMC Lincoln Square IMAX',
          address: '1998 Broadway, New York, NY 10023'
        },
        pricing: {
          basePrice: 18.99,
          vipPrice: 25.99
        },
        poster: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_450,q_auto,w_300/v1/cursed-ticket/posters/cursed-ticket/poster/dune.auto',
        wallpaper: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_1080,q_auto,w_1920/v1/cursed-ticket/wallpapers/cursed-ticket/wallpaper/dune.auto',
        showDates: [
          {
            date: new Date('2024-12-21T19:00:00'),
            seating: {
              totalSeats: 200,
              takenSeats: [1, 5, 10, 15, 20],
              availableSeats: 195
            }
          },
          {
            date: new Date('2024-12-22T19:00:00'),
            seating: {
              totalSeats: 200,
              takenSeats: [2, 6, 11, 16, 21],
              availableSeats: 195
            }
          }
        ]
      },
      {
        name: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        date: new Date('2024-12-25'),
        location: {
          name: 'Regal Cinemas',
          address: '890 Broadway, New York, NY 10003'
        },
        pricing: {
          basePrice: 16.99,
          vipPrice: 22.99
        },
        poster: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_450,q_auto,w_300/v1/cursed-ticket/posters/cursed-ticket/poster/inception.auto',
        wallpaper: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_1080,q_auto,w_1920/v1/cursed-ticket/wallpapers/cursed-ticket/wallpaper/inception.auto',
        showDates: [
          {
            date: new Date('2024-12-25T20:00:00'),
            seating: {
              totalSeats: 180,
              takenSeats: [3, 7, 12, 17, 22],
              availableSeats: 175
            }
          }
        ]
      }
    ];

    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log(`✅ Created ${movies.length} movies`);

    console.log('\n🎭 Creating sample stage plays...');
    
    const stagePlays = [
      {
        name: 'Hamilton',
        description: 'The story of American Founding Father Alexander Hamilton, told through hip-hop, R&B, and traditional show tunes.',
        date: new Date('2024-12-26'),
        location: {
          name: 'Richard Rodgers Theatre',
          address: '226 W 46th St, New York, NY 10036'
        },
        pricing: {
          basePrice: 199.99,
          vipPrice: 299.99
        },
        poster: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_450,q_auto,w_300/v1/cursed-ticket/posters/cursed-ticket/poster/hamilton.auto',
        wallpaper: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_1080,q_auto,w_1920/v1/cursed-ticket/wallpapers/cursed-ticket/wallpaper/hamilton.auto',
        showDates: [
          {
            date: new Date('2024-12-26T19:30:00'),
            seating: {
              totalSeats: 150,
              takenSeats: [4, 8, 13, 18, 23],
              availableSeats: 145
            }
          }
        ]
      }
    ];

    await StagePlays.deleteMany({});
    await StagePlays.insertMany(stagePlays);
    console.log(`✅ Created ${stagePlays.length} stage plays`);

    console.log('\n🎼 Creating sample orchestra events...');
    
    const orchestra = [
      {
        name: 'Beethoven Symphony No. 9',
        description: 'Experience the power and beauty of Beethoven\'s Ninth Symphony, featuring the famous "Ode to Joy" finale.',
        date: new Date('2024-12-28'),
        location: {
          name: 'Carnegie Hall',
          address: '881 7th Ave, New York, NY 10019'
        },
        pricing: {
          basePrice: 89.99,
          vipPrice: 149.99
        },
        poster: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_450,q_auto,w_300/v1/cursed-ticket/posters/cursed-ticket/poster/beethoven-symphony.auto',
        wallpaper: 'https://res.cloudinary.com/dmeqmodtz/image/upload/c_fill,h_1080,q_auto,w_1920/v1/cursed-ticket/wallpapers/cursed-ticket/wallpaper/beethoven-symphony.auto',
        showDates: [
          {
            date: new Date('2024-12-28T20:00:00'),
            seating: {
              totalSeats: 120,
              takenSeats: [5, 9, 14, 19, 24],
              availableSeats: 115
            }
          }
        ]
      }
    ];

    await LiveOrchestra.deleteMany({});
    await LiveOrchestra.insertMany(orchestra);
    console.log(`✅ Created ${orchestra.length} orchestra events`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Friend can now:');
    console.log('1. Update their .env file with the connection string');
    console.log('2. Run: npm start');
    console.log('3. Open: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
