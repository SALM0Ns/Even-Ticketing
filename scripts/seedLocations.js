const mongoose = require('mongoose');
require('dotenv').config();

// Import Location model
const Location = require('../models/Location');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Event'
    });
    console.log('✅ Connected to MongoDB for location seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample locations data
const locationsData = [
  // Cinema Locations for Movies
  {
    name: 'AMC Lincoln Square',
    address: '1998 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10023',
    country: 'USA',
    capacity: 500,
    description: 'Premium movie theater with IMAX and Dolby Cinema',
    amenities: ['IMAX', 'Dolby Cinema', 'Reclining Seats', 'Bar', 'Concessions'],
    contactInfo: {
      phone: '+1-212-336-5020',
      email: 'info@amctheatres.com',
      website: 'https://www.amctheatres.com'
    },
    coordinates: {
      latitude: 40.7789,
      longitude: -73.9820
    },
    venueType: 'cinema'
  },
  {
    name: 'AMC Lincoln Square IMAX',
    address: '1998 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10023',
    country: 'USA',
    capacity: 500,
    description: 'IMAX theater with premium sound and visual experience',
    amenities: ['IMAX', 'Premium Sound', 'Reclining Seats', 'Concessions'],
    contactInfo: {
      phone: '+1-212-336-5020',
      email: 'info@amctheatres.com',
      website: 'https://www.amctheatres.com'
    },
    coordinates: {
      latitude: 40.7789,
      longitude: -73.9820
    },
    venueType: 'cinema'
  },
  {
    name: 'Alamo Drafthouse',
    address: '445 Albee Square W',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    country: 'USA',
    capacity: 300,
    description: 'Dine-in movie theater with craft beer and food',
    amenities: ['Dine-in Service', 'Craft Beer', 'Full Bar', 'Reclining Seats'],
    contactInfo: {
      phone: '+1-718-855-2000',
      email: 'brooklyn@drafthouse.com',
      website: 'https://drafthouse.com'
    },
    coordinates: {
      latitude: 40.6905,
      longitude: -73.9857
    },
    venueType: 'cinema'
  },
  {
    name: 'Cinemark Times Square',
    address: '234 W 42nd St',
    city: 'New York',
    state: 'NY',
    zipCode: '10036',
    country: 'USA',
    capacity: 540,
    description: 'Modern cinema in the heart of Times Square',
    amenities: ['Dolby Cinema', 'Reclining Seats', 'Concessions', 'Accessibility'],
    contactInfo: {
      phone: '+1-212-398-3939',
      email: 'timessquare@cinemark.com',
      website: 'https://www.cinemark.com'
    },
    coordinates: {
      latitude: 40.7580,
      longitude: -73.9855
    },
    venueType: 'cinema'
  },
  
  // Theater Locations for Stage Plays
  {
    name: 'Majestic Theatre',
    address: '245 W 44th St',
    city: 'New York',
    state: 'NY',
    zipCode: '10036',
    country: 'USA',
    capacity: 200,
    description: 'Historic Broadway theater for musicals and plays',
    amenities: ['Historic Architecture', 'Premium Seating', 'Accessibility Features'],
    contactInfo: {
      phone: '+1-212-239-6200',
      email: 'info@majestictheatre.com',
      website: 'https://majestictheatre.com'
    },
    coordinates: {
      latitude: 40.7578,
      longitude: -73.9857
    },
    venueType: 'theater'
  },
  {
    name: 'Richard Rodgers Theatre',
    address: '226 W 46th St',
    city: 'New York',
    state: 'NY',
    zipCode: '10036',
    country: 'USA',
    capacity: 180,
    description: 'Intimate Broadway theater for musical productions',
    amenities: ['Intimate Setting', 'Premium Acoustics', 'Historic Venue'],
    contactInfo: {
      phone: '+1-212-221-1211',
      email: 'info@richardrodgerstheatre.com',
      website: 'https://richardrodgerstheatre.com'
    },
    coordinates: {
      latitude: 40.7590,
      longitude: -73.9855
    },
    venueType: 'theater'
  },
  {
    name: 'Minskoff Theatre',
    address: '200 W 45th St',
    city: 'New York',
    state: 'NY',
    zipCode: '10036',
    country: 'USA',
    capacity: 220,
    description: 'Modern Broadway theater with excellent sightlines',
    amenities: ['Modern Design', 'Excellent Sightlines', 'Accessibility'],
    contactInfo: {
      phone: '+1-212-869-0550',
      email: 'info@minskofftheatre.com',
      website: 'https://minskofftheatre.com'
    },
    coordinates: {
      latitude: 40.7584,
      longitude: -73.9856
    },
    venueType: 'theater'
  },
  
  // Concert Hall Locations for Live Orchestra
  {
    name: 'Carnegie Hall',
    address: '881 7th Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10019',
    country: 'USA',
    capacity: 300,
    description: 'World-renowned concert hall for classical music',
    amenities: ['Acoustic Excellence', 'Historic Venue', 'Premium Seating', 'Accessibility'],
    contactInfo: {
      phone: '+1-212-247-7800',
      email: 'info@carnegiehall.org',
      website: 'https://www.carnegiehall.org'
    },
    coordinates: {
      latitude: 40.7650,
      longitude: -73.9799
    },
    venueType: 'concert_hall'
  },
  {
    name: 'Lincoln Center - David Geffen Hall',
    address: '10 Lincoln Center Plaza',
    city: 'New York',
    state: 'NY',
    zipCode: '10023',
    country: 'USA',
    capacity: 400,
    description: 'Home of the New York Philharmonic',
    amenities: ['Acoustic Excellence', 'Modern Design', 'Premium Seating'],
    contactInfo: {
      phone: '+1-212-875-5000',
      email: 'info@lincolncenter.org',
      website: 'https://www.lincolncenter.org'
    },
    coordinates: {
      latitude: 40.7720,
      longitude: -73.9830
    },
    venueType: 'concert_hall'
  },
  {
    name: 'Metropolitan Opera House',
    address: '30 Lincoln Center Plaza',
    city: 'New York',
    state: 'NY',
    zipCode: '10023',
    country: 'USA',
    capacity: 250,
    description: 'Historic opera house with world-class acoustics',
    amenities: ['Historic Venue', 'World-class Acoustics', 'Premium Seating'],
    contactInfo: {
      phone: '+1-212-362-6000',
      email: 'info@metopera.org',
      website: 'https://www.metopera.org'
    },
    coordinates: {
      latitude: 40.7720,
      longitude: -73.9830
    },
    venueType: 'concert_hall'
  },
  {
    name: 'New York City Ballet - David H. Koch Theater',
    address: '20 Lincoln Center Plaza',
    city: 'New York',
    state: 'NY',
    zipCode: '10023',
    country: 'USA',
    capacity: 350,
    description: 'Modern theater for ballet and dance performances',
    amenities: ['Modern Design', 'Excellent Sightlines', 'Premium Seating'],
    contactInfo: {
      phone: '+1-212-496-0600',
      email: 'info@nycballet.com',
      website: 'https://www.nycballet.com'
    },
    coordinates: {
      latitude: 40.7720,
      longitude: -73.9830
    },
    venueType: 'concert_hall'
  }
];

// Seed locations
const seedLocations = async () => {
  try {
    console.log('🌱 Starting location seeding...');
    
    // Clear existing locations
    await Location.deleteMany({});
    console.log('🗑️  Cleared existing locations');
    
    // Insert new locations
    const locations = await Location.insertMany(locationsData);
    console.log(`✅ Seeded ${locations.length} locations`);
    
    // Display summary
    console.log('\n📊 Location Summary:');
    locations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.name} (${location.city}, ${location.country}) - Capacity: ${location.capacity}`);
    });
    
    console.log('\n🎉 Location seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
const runSeeding = async () => {
  await connectDB();
  await seedLocations();
};

runSeeding();
