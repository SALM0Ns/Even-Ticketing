const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'USA'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  venueType: {
    type: String,
    enum: ['cinema', 'theater', 'concert_hall'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
locationSchema.index({ name: 'text', city: 'text', address: 'text' });

module.exports = mongoose.model('Location', locationSchema);
