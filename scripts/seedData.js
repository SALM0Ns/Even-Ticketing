const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
const User = require('../models/User');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Event'
    });
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample organizer user
const createOrganizer = async () => {
  try {
    // Check if organizer already exists
    let organizer = await User.findOne({ email: 'organizer@entertainment.com' });
    
    if (!organizer) {
      organizer = new User({
        name: 'Entertainment Manager',
        email: 'organizer@entertainment.com',
        password: 'password123',
        role: 'organizer',
        profile: {
          phone: '+1-555-0123',
          address: {
            street: '123 Entertainment Blvd',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        organizerProfile: {
          companyName: 'Premier Entertainment Group',
          businessLicense: 'ENT-2024-001',
          website: 'https://premierentertainment.com',
          description: 'Leading provider of premium entertainment experiences',
          specialties: ['movies', 'stage-plays', 'orchestra'],
          venues: [
            {
              name: 'Grand Theater',
              address: '456 Broadway, New York, NY',
              capacity: 1200,
              facilities: ['IMAX', 'Dolby Atmos', 'Accessibility']
            }
          ]
        }
      });
      
      await organizer.save();
      console.log('✅ Created organizer user');
    }
    
    return organizer;
  } catch (error) {
    console.error('❌ Error creating organizer:', error);
    throw error;
  }
};

// Seed Movies
const seedMovies = async (organizer) => {
  try {
    const movies = [
      {
        name: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        image: "/images/oppenheimer.jpg",
        date: new Date('2025-03-15T19:00:00'),
        endDate: new Date('2025-04-15T23:59:59'),
        showtimes: [
          { time: "14:00", availableSeats: 150, totalSeats: 150 },
          { time: "17:30", availableSeats: 200, totalSeats: 200 },
          { time: "21:00", availableSeats: 180, totalSeats: 180 }
        ],
        location: {
          name: "AMC Lincoln Square",
          address: "1998 Broadway, New York, NY 10023",
          city: "New York",
          capacity: 500
        },
        pricing: {
          basePrice: 15.99,
          vipPrice: 24.99,
          studentPrice: 12.99,
          seniorPrice: 13.99
        },
        movieDetails: {
          director: "Christopher Nolan",
          cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
          genre: ["Drama", "Biography", "History"],
          duration: 180,
          rating: "R",
          language: "English",
          subtitles: true,
          releaseYear: 2023,
          imdbRating: 8.5
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasImax: true,
          has3D: false,
          hasDolby: true,
          hasRecliningSeats: true,
          hasFoodService: true,
          hasParking: true
        }
      },
      {
        name: "Dune",
        description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        image: "/images/dune-poster.jpg",
        date: new Date('2025-03-20T19:00:00'),
        endDate: new Date('2025-04-20T23:59:59'),
        showtimes: [
          { time: "13:30", availableSeats: 120, totalSeats: 120 },
          { time: "16:45", availableSeats: 150, totalSeats: 150 },
          { time: "20:15", availableSeats: 200, totalSeats: 200 }
        ],
        location: {
          name: "AMC Lincoln Square IMAX",
          address: "1998 Broadway, New York, NY 10023",
          city: "New York",
          capacity: 500
        },
        pricing: {
          basePrice: 18.99,
          vipPrice: 28.99,
          studentPrice: 15.99,
          seniorPrice: 16.99
        },
        movieDetails: {
          director: "Denis Villeneuve",
          cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin", "Stellan Skarsgård", "Dave Bautista", "Zendaya", "Javier Bardem"],
          genre: ["Sci-Fi", "Adventure", "Drama"],
          duration: 155,
          rating: "PG-13",
          language: "English",
          subtitles: true,
          releaseYear: 2021,
          imdbRating: 8.0
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasImax: true,
          has3D: true,
          hasDolby: true,
          hasRecliningSeats: true,
          hasFoodService: true,
          hasParking: true
        }
      },
      {
        name: "Kill Bill: Vol. 1",
        description: "After awakening from a four-year coma, a former assassin wreaks vengeance on the team of assassins who betrayed her.",
        image: "/images/killbill.jpg",
        date: new Date('2025-03-25T19:00:00'),
        endDate: new Date('2025-04-25T23:59:59'),
        showtimes: [
          { time: "15:00", availableSeats: 100, totalSeats: 100 },
          { time: "18:30", availableSeats: 120, totalSeats: 120 },
          { time: "22:00", availableSeats: 80, totalSeats: 80 }
        ],
        location: {
          name: "Alamo Drafthouse",
          address: "445 Albee Square W, Brooklyn, NY 11201",
          city: "New York",
          capacity: 300
        },
        pricing: {
          basePrice: 14.99,
          vipPrice: 22.99,
          studentPrice: 11.99,
          seniorPrice: 12.99
        },
        movieDetails: {
          director: "Quentin Tarantino",
          cast: ["Uma Thurman", "Lucy Liu", "Vivica A. Fox", "Daryl Hannah"],
          genre: ["Action", "Crime", "Thriller"],
          duration: 111,
          rating: "R",
          language: "English",
          subtitles: false,
          releaseYear: 2003,
          imdbRating: 8.1
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasImax: false,
          has3D: false,
          hasDolby: false,
          hasRecliningSeats: true,
          hasFoodService: true,
          hasParking: true
        }
      },
      {
        name: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
        image: "/images/inception.jpg",
        date: new Date('2025-04-01T19:00:00'),
        endDate: new Date('2025-05-01T23:59:59'),
        showtimes: [
          { time: "14:15", availableSeats: 180, totalSeats: 180 },
          { time: "17:45", availableSeats: 200, totalSeats: 200 },
          { time: "21:30", availableSeats: 160, totalSeats: 160 }
        ],
        location: {
          name: "Cinemark Times Square",
          address: "234 W 42nd St, New York, NY 10036",
          city: "New York",
          capacity: 540
        },
        pricing: {
          basePrice: 17.99,
          vipPrice: 27.99,
          studentPrice: 14.99,
          seniorPrice: 15.99
        },
        movieDetails: {
          director: "Christopher Nolan",
          cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Elliot Page"],
          genre: ["Action", "Sci-Fi", "Thriller"],
          duration: 148,
          rating: "PG-13",
          language: "English",
          subtitles: true,
          releaseYear: 2010,
          imdbRating: 8.8
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasImax: true,
          has3D: false,
          hasDolby: true,
          hasRecliningSeats: true,
          hasFoodService: true,
          hasParking: false
        }
      }
    ];

    // Clear existing movies
    await Movie.deleteMany({});
    
    // Insert new movies
    for (const movieData of movies) {
      const movie = new Movie(movieData);
      await movie.save();
    }
    
    console.log(`✅ Seeded ${movies.length} movies`);
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
    throw error;
  }
};

// Seed Stage Plays
const seedStagePlays = async (organizer) => {
  try {
    const stagePlays = [
      {
        name: "The Phantom of the Opera",
        description: "A disfigured musical genius, hidden away in the Paris Opera House, terrorizes the opera company for the unwitting benefit of a young protégée whom he trains and loves.",
        image: "/images/phantom.jpg",
        date: new Date('2025-03-18T19:30:00'),
        endDate: new Date('2025-04-18T22:30:00'),
        performances: [
          { date: new Date('2025-03-18T19:30:00'), time: "19:30", availableSeats: 200, totalSeats: 200 },
          { date: new Date('2025-03-20T19:30:00'), time: "19:30", availableSeats: 200, totalSeats: 200 },
          { date: new Date('2025-03-22T19:30:00'), time: "19:30", availableSeats: 200, totalSeats: 200 },
          { date: new Date('2025-03-24T14:00:00'), time: "14:00", availableSeats: 200, totalSeats: 200 }
        ],
        location: {
          name: "Majestic Theatre",
          address: "245 W 44th St, New York, NY 10036",
          city: "New York",
          capacity: 200
        },
        pricing: {
          basePrice: 89.99,
          vipPrice: 149.99,
          studentPrice: 69.99,
          seniorPrice: 79.99
        },
        stagePlayDetails: {
          playwright: "Andrew Lloyd Webber",
          cast: [
            { name: "Ben Crawford", role: "The Phantom" },
            { name: "Emilie Kouatchou", role: "Christine Daaé" },
            { name: "John Riddle", role: "Raoul" },
            { name: "Maree Johnson", role: "Carlotta" }
          ],
          genre: ["Musical", "Romance", "Drama"],
          duration: 150,
          intermission: true,
          intermissionDuration: 15,
          ageRestriction: "All Ages",
          language: "English",
          originalYear: 1986,
          awards: ["Tony Award for Best Musical", "Olivier Award for Best Musical"],
          reviews: [
            { source: "The New York Times", rating: 5, comment: "A timeless masterpiece" },
            { source: "Variety", rating: 5, comment: "Spectacular production" }
          ]
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasFoodService: true,
          hasMerchandise: true
        }
      },
      {
        name: "Hamilton",
        description: "The story of American Founding Father Alexander Hamilton, told through hip-hop, R&B, and traditional show tunes.",
        image: "/images/hamilton.jpg",
        date: new Date('2025-03-22T20:00:00'),
        endDate: new Date('2025-04-22T23:00:00'),
        performances: [
          { date: new Date('2025-03-22T20:00:00'), time: "20:00", availableSeats: 180, totalSeats: 180 },
          { date: new Date('2025-03-24T20:00:00'), time: "20:00", availableSeats: 180, totalSeats: 180 },
          { date: new Date('2025-03-26T20:00:00'), time: "20:00", availableSeats: 180, totalSeats: 180 },
          { date: new Date('2025-03-28T14:00:00'), time: "14:00", availableSeats: 180, totalSeats: 180 }
        ],
        location: {
          name: "Richard Rodgers Theatre",
          address: "226 W 46th St, New York, NY 10036",
          city: "New York",
          capacity: 180
        },
        pricing: {
          basePrice: 199.99,
          vipPrice: 399.99,
          studentPrice: 149.99,
          seniorPrice: 179.99
        },
        stagePlayDetails: {
          playwright: "Lin-Manuel Miranda",
          cast: [
            { name: "Miguel Cervantes", role: "Alexander Hamilton" },
            { name: "Krystal Joy Brown", role: "Eliza Hamilton" },
            { name: "Jin Ha", role: "Aaron Burr" },
            { name: "Tamar Greene", role: "George Washington" }
          ],
          genre: ["Musical", "Hip-Hop", "History"],
          duration: 165,
          intermission: true,
          intermissionDuration: 15,
          ageRestriction: "13+",
          language: "English",
          originalYear: 2015,
          awards: ["Pulitzer Prize for Drama", "Tony Award for Best Musical"],
          reviews: [
            { source: "The New Yorker", rating: 5, comment: "Revolutionary musical theater" },
            { source: "Time Magazine", rating: 5, comment: "A cultural phenomenon" }
          ]
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: false,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasFoodService: true,
          hasMerchandise: true
        }
      },
      {
        name: "The Lion King",
        description: "A musical adaptation of the Disney animated film, featuring the story of Simba, a young lion who must embrace his role as king.",
        image: "/images/lionking.jpg",
        date: new Date('2025-03-25T19:00:00'),
        endDate: new Date('2025-04-25T21:30:00'),
        performances: [
          { date: new Date('2025-03-25T19:00:00'), time: "19:00", availableSeats: 220, totalSeats: 220 },
          { date: new Date('2025-03-27T19:00:00'), time: "19:00", availableSeats: 220, totalSeats: 220 },
          { date: new Date('2025-03-29T19:00:00'), time: "19:00", availableSeats: 220, totalSeats: 220 },
          { date: new Date('2025-03-31T13:00:00'), time: "13:00", availableSeats: 220, totalSeats: 220 }
        ],
        location: {
          name: "Minskoff Theatre",
          address: "200 W 45th St, New York, NY 10036",
          city: "New York",
          capacity: 220
        },
        pricing: {
          basePrice: 79.99,
          vipPrice: 129.99,
          studentPrice: 59.99,
          seniorPrice: 69.99
        },
        stagePlayDetails: {
          playwright: "Roger Allers & Irene Mecchi",
          cast: [
            { name: "Stephen Carlile", role: "Scar" },
            { name: "Brittney Johnson", role: "Nala" },
            { name: "Dashaun Young", role: "Simba" },
            { name: "Tshidi Manye", role: "Rafiki" }
          ],
          genre: ["Musical", "Family", "Adventure"],
          duration: 150,
          intermission: true,
          intermissionDuration: 15,
          ageRestriction: "All Ages",
          language: "English",
          originalYear: 1997,
          awards: ["Tony Award for Best Musical", "Drama Desk Award"],
          reviews: [
            { source: "Entertainment Weekly", rating: 5, comment: "Visually stunning" },
            { source: "USA Today", rating: 4, comment: "Perfect for families" }
          ]
        },
        organizer: organizer._id,
        theaterFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasFoodService: true,
          hasMerchandise: true
        }
      }
    ];

    // Clear existing stage plays
    await StagePlays.deleteMany({});
    
    // Insert new stage plays
    for (const playData of stagePlays) {
      const play = new StagePlays(playData);
      await play.save();
    }
    
    console.log(`✅ Seeded ${stagePlays.length} stage plays`);
  } catch (error) {
    console.error('❌ Error seeding stage plays:', error);
    throw error;
  }
};

// Seed Live Orchestra
const seedLiveOrchestra = async (organizer) => {
  try {
    const liveOrchestra = [
      {
        name: "Chopin Piano Concerto No. 1",
        description: "Experience the romantic beauty of Chopin's Piano Concerto No. 1 performed by world-renowned pianist Yuja Wang with the New York Philharmonic.",
        image: "/images/chopin.jpg",
        date: new Date('2025-03-20T20:00:00'),
        endDate: new Date('2025-03-20T22:30:00'),
        performances: [
          { date: new Date('2025-03-20T20:00:00'), time: "20:00", availableSeats: 300, totalSeats: 300 },
          { date: new Date('2025-03-22T20:00:00'), time: "20:00", availableSeats: 300, totalSeats: 300 }
        ],
        location: {
          name: "Carnegie Hall",
          address: "881 7th Ave, New York, NY 10019",
          city: "New York",
          capacity: 300
        },
        pricing: {
          basePrice: 89.99,
          vipPrice: 199.99,
          studentPrice: 49.99,
          seniorPrice: 69.99
        },
        orchestraDetails: {
          conductor: "Gustavo Dudamel",
          orchestra: "New York Philharmonic",
          performers: [
            { name: "Yuja Wang", instrument: "Piano", isSoloist: true },
            { name: "Frank Huang", instrument: "Violin", isSoloist: false },
            { name: "Carter Brey", instrument: "Cello", isSoloist: false }
          ],
          repertoire: [
            { composer: "Frédéric Chopin", piece: "Piano Concerto No. 1 in E minor, Op. 11", duration: 40, movement: "I. Allegro maestoso" },
            { composer: "Frédéric Chopin", piece: "Piano Concerto No. 1 in E minor, Op. 11", duration: 35, movement: "II. Romance" },
            { composer: "Frédéric Chopin", piece: "Piano Concerto No. 1 in E minor, Op. 11", duration: 30, movement: "III. Rondo" }
          ],
          duration: 105,
          intermission: true,
          intermissionDuration: 20,
          dressCode: "Formal",
          program: "An evening of romantic piano music featuring Chopin's beloved first piano concerto, showcasing the virtuosic talents of Yuja Wang.",
          season: "Spring 2024",
          series: "Piano Masters"
        },
        organizer: organizer._id,
        venueFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasVisualAssistance: false,
          hasFoodService: true,
          hasMerchandise: true,
          hasCoatCheck: true
        }
      },
      {
        name: "Beethoven Symphony No. 9 'Ode to Joy'",
        description: "Experience the triumphant finale of Beethoven's Ninth Symphony with full chorus and soloists in this magnificent performance.",
        image: "/images/beethoven9.jpg",
        date: new Date('2025-03-28T19:30:00'),
        endDate: new Date('2025-03-28T22:00:00'),
        performances: [
          { date: new Date('2025-03-28T19:30:00'), time: "19:30", availableSeats: 400, totalSeats: 400 }
        ],
        location: {
          name: "Lincoln Center - David Geffen Hall",
          address: "10 Lincoln Center Plaza, New York, NY 10023",
          city: "New York",
          capacity: 400
        },
        pricing: {
          basePrice: 99.99,
          vipPrice: 249.99,
          studentPrice: 59.99,
          seniorPrice: 79.99
        },
        orchestraDetails: {
          conductor: "Jaap van Zweden",
          orchestra: "New York Philharmonic",
          performers: [
            { name: "Renée Fleming", instrument: "Soprano", isSoloist: true },
            { name: "Joyce DiDonato", instrument: "Mezzo-soprano", isSoloist: true },
            { name: "Matthew Polenzani", instrument: "Tenor", isSoloist: true },
            { name: "Eric Owens", instrument: "Bass-baritone", isSoloist: true }
          ],
          repertoire: [
            { composer: "Ludwig van Beethoven", piece: "Symphony No. 9 in D minor, Op. 125", duration: 70, movement: "I. Allegro ma non troppo" },
            { composer: "Ludwig van Beethoven", piece: "Symphony No. 9 in D minor, Op. 125", duration: 15, movement: "II. Molto vivace" },
            { composer: "Ludwig van Beethoven", piece: "Symphony No. 9 in D minor, Op. 125", duration: 20, movement: "III. Adagio molto e cantabile" },
            { composer: "Ludwig van Beethoven", piece: "Symphony No. 9 in D minor, Op. 125", duration: 25, movement: "IV. Finale (Ode to Joy)" }
          ],
          duration: 130,
          intermission: true,
          intermissionDuration: 20,
          dressCode: "Black Tie",
          program: "Beethoven's monumental Ninth Symphony featuring the famous 'Ode to Joy' finale with full chorus and world-class soloists.",
          season: "Spring 2024",
          series: "Masterworks"
        },
        organizer: organizer._id,
        venueFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasVisualAssistance: true,
          hasFoodService: true,
          hasMerchandise: true,
          hasCoatCheck: true
        }
      },
      {
        name: "Mozart's Requiem",
        description: "Experience the profound beauty and drama of Mozart's final masterpiece, the Requiem Mass in D minor.",
        image: "/images/mozart-requiem.jpg",
        date: new Date('2025-04-05T20:00:00'),
        endDate: new Date('2025-04-05T22:15:00'),
        performances: [
          { date: new Date('2025-04-05T20:00:00'), time: "20:00", availableSeats: 250, totalSeats: 250 }
        ],
        location: {
          name: "Metropolitan Opera House",
          address: "30 Lincoln Center Plaza, New York, NY 10023",
          city: "New York",
          capacity: 250
        },
        pricing: {
          basePrice: 79.99,
          vipPrice: 179.99,
          studentPrice: 39.99,
          seniorPrice: 59.99
        },
        orchestraDetails: {
          conductor: "Yannick Nézet-Séguin",
          orchestra: "Metropolitan Opera Orchestra",
          performers: [
            { name: "Lisette Oropesa", instrument: "Soprano", isSoloist: true },
            { name: "Jamie Barton", instrument: "Mezzo-soprano", isSoloist: true },
            { name: "Matthew Polenzani", instrument: "Tenor", isSoloist: true },
            { name: "Christian Van Horn", instrument: "Bass", isSoloist: true }
          ],
          repertoire: [
            { composer: "Wolfgang Amadeus Mozart", piece: "Requiem in D minor, K. 626", duration: 55, movement: "I. Introitus" },
            { composer: "Wolfgang Amadeus Mozart", piece: "Requiem in D minor, K. 626", duration: 20, movement: "II. Kyrie" },
            { composer: "Wolfgang Amadeus Mozart", piece: "Requiem in D minor, K. 626", duration: 30, movement: "III. Dies Irae" },
            { composer: "Wolfgang Amadeus Mozart", piece: "Requiem in D minor, K. 626", duration: 25, movement: "IV. Lacrimosa" }
          ],
          duration: 135,
          intermission: true,
          intermissionDuration: 20,
          dressCode: "Formal",
          program: "Mozart's haunting and beautiful Requiem, his final composition, performed with full orchestra, chorus, and soloists.",
          season: "Spring 2024",
          series: "Sacred Music"
        },
        organizer: organizer._id,
        venueFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasVisualAssistance: true,
          hasFoodService: true,
          hasMerchandise: true,
          hasCoatCheck: true
        }
      },
      {
        name: "Tchaikovsky's Swan Lake",
        description: "Experience the timeless beauty of Tchaikovsky's Swan Lake ballet with full orchestra accompaniment.",
        image: "/images/swan-lake.jpg",
        date: new Date('2025-04-12T19:00:00'),
        endDate: new Date('2025-04-12T22:00:00'),
        performances: [
          { date: new Date('2025-04-12T19:00:00'), time: "19:00", availableSeats: 350, totalSeats: 350 },
          { date: new Date('2025-04-14T19:00:00'), time: "19:00", availableSeats: 350, totalSeats: 350 }
        ],
        location: {
          name: "New York City Ballet - David H. Koch Theater",
          address: "20 Lincoln Center Plaza, New York, NY 10023",
          city: "New York",
          capacity: 350
        },
        pricing: {
          basePrice: 89.99,
          vipPrice: 199.99,
          studentPrice: 49.99,
          seniorPrice: 69.99
        },
        orchestraDetails: {
          conductor: "Andrew Litton",
          orchestra: "New York City Ballet Orchestra",
          performers: [
            { name: "Tiler Peck", instrument: "Principal Dancer", isSoloist: true },
            { name: "Roman Mejia", instrument: "Principal Dancer", isSoloist: true },
            { name: "Unity Phelan", instrument: "Soloist", isSoloist: true }
          ],
          repertoire: [
            { composer: "Pyotr Ilyich Tchaikovsky", piece: "Swan Lake, Op. 20", duration: 60, movement: "Act I" },
            { composer: "Pyotr Ilyich Tchaikovsky", piece: "Swan Lake, Op. 20", duration: 45, movement: "Act II" },
            { composer: "Pyotr Ilyich Tchaikovsky", piece: "Swan Lake, Op. 20", duration: 50, movement: "Act III" },
            { composer: "Pyotr Ilyich Tchaikovsky", piece: "Swan Lake, Op. 20", duration: 30, movement: "Act IV" }
          ],
          duration: 185,
          intermission: true,
          intermissionDuration: 25,
          dressCode: "Smart Casual",
          program: "The classic tale of love, betrayal, and redemption told through Tchaikovsky's magnificent score and breathtaking choreography.",
          season: "Spring 2024",
          series: "Ballet Classics"
        },
        organizer: organizer._id,
        venueFeatures: {
          hasBalcony: true,
          hasOrchestra: true,
          hasMezzanine: true,
          hasBoxSeats: true,
          hasAccessibility: true,
          hasHearingAssistance: true,
          hasVisualAssistance: false,
          hasFoodService: true,
          hasMerchandise: true,
          hasCoatCheck: true
        }
      }
    ];

    // Clear existing live orchestra
    await LiveOrchestra.deleteMany({});
    
    // Insert new live orchestra
    for (const orchestraData of liveOrchestra) {
      const orchestra = new LiveOrchestra(orchestraData);
      await orchestra.save();
    }
    
    console.log(`✅ Seeded ${liveOrchestra.length} live orchestra performances`);
  } catch (error) {
    console.error('❌ Error seeding live orchestra:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Create organizer
    const organizer = await createOrganizer();
    
    // Seed all collections
    await seedMovies(organizer);
    await seedStagePlays(organizer);
    await seedLiveOrchestra(organizer);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Movies: 4 (Christopher Nolan, Denis Villeneuve, Quentin Tarantino)');
    console.log('- Stage Plays: 3 (Phantom of the Opera, Hamilton, Lion King)');
    console.log('- Live Orchestra: 4 (Chopin, Beethoven, Mozart, Tchaikovsky)');
    console.log('- Organizer: 1 (Premier Entertainment Group)');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
