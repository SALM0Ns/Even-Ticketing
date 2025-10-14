const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Movie name is required'],
        trim: true,
        maxlength: [100, 'Movie name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Movie description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        default: '/images/default-movie.jpg'
    },
    date: {
        type: Date,
        required: [true, 'Show date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    showtimes: [{
        time: {
            type: String,
            required: true
        },
        availableSeats: {
            type: Number,
            required: true,
            min: [0, 'Available seats cannot be negative']
        },
        totalSeats: {
            type: Number,
            required: true,
            min: [1, 'Total seats must be at least 1']
        }
    }],
    location: {
        name: {
            type: String,
            required: [true, 'Theater name is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Theater address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        capacity: {
            type: Number,
            required: [true, 'Theater capacity is required'],
            min: [1, 'Capacity must be at least 1']
        }
    },
    pricing: {
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative']
        },
        vipPrice: {
            type: Number,
            default: null
        },
        studentPrice: {
            type: Number,
            default: null
        },
        seniorPrice: {
            type: Number,
            default: null
        }
    },
    movieDetails: {
        director: {
            type: String,
            required: [true, 'Director is required']
        },
        cast: [{
            type: String,
            required: true
        }],
        genre: [{
            type: String,
            required: true
        }],
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 minute']
        },
        rating: {
            type: String,
            required: [true, 'Rating is required'],
            enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
        },
        language: {
            type: String,
            required: [true, 'Language is required']
        },
        subtitles: {
            type: Boolean,
            default: false
        },
        releaseYear: {
            type: Number,
            required: [true, 'Release year is required']
        },
        imdbRating: {
            type: Number,
            min: 0,
            max: 10
        }
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required']
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'ended', 'cancelled'],
        default: 'upcoming'
    },
    // Theater-specific features
    theaterFeatures: {
        hasImax: {
            type: Boolean,
            default: false
        },
        has3D: {
            type: Boolean,
            default: false
        },
        hasDolby: {
            type: Boolean,
            default: false
        },
        hasRecliningSeats: {
            type: Boolean,
            default: false
        },
        hasFoodService: {
            type: Boolean,
            default: false
        },
        hasParking: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true,
    collection: 'Movie' // Use your existing 'Movie' collection
});

// Indexes for better performance
movieSchema.index({ date: 1 });
movieSchema.index({ organizer: 1 });
movieSchema.index({ status: 1 });
movieSchema.index({ 'location.city': 1 });
movieSchema.index({ 'movieDetails.genre': 1 });

// Virtual for checking if movie is sold out
movieSchema.virtual('isSoldOut').get(function() {
    return this.showtimes.every(showtime => showtime.availableSeats === 0);
});

// Virtual for checking if movie is starting soon (within 24 hours)
movieSchema.virtual('isStartingSoon').get(function() {
    const now = new Date();
    const movieTime = new Date(this.date);
    const timeDiff = movieTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
});

// Method to get category display name
movieSchema.methods.getCategoryDisplayName = function() {
    return 'Movies';
};

// Method to get category icon
movieSchema.methods.getCategoryIcon = function() {
    return 'fas fa-film';
};

// Method to get category color
movieSchema.methods.getCategoryColor = function() {
    return 'primary';
};

// Method to get available showtimes
movieSchema.methods.getAvailableShowtimes = function() {
    return this.showtimes.filter(showtime => showtime.availableSeats > 0);
};

// Method to book seats for a specific showtime
movieSchema.methods.bookSeats = function(showtimeIndex, numberOfSeats) {
    if (showtimeIndex >= 0 && showtimeIndex < this.showtimes.length) {
        const showtime = this.showtimes[showtimeIndex];
        if (showtime.availableSeats >= numberOfSeats) {
            showtime.availableSeats -= numberOfSeats;
            return true;
        }
    }
    return false;
};

// Pre-save middleware to update status based on date
movieSchema.pre('save', function(next) {
    const now = new Date();
    if (this.date <= now) {
        this.status = 'ended';
    } else if (this.date <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        this.status = 'ongoing';
    }
    next();
});

// Static method to find movies by genre
movieSchema.statics.findByGenre = function(genre) {
    return this.find({ 'movieDetails.genre': genre, status: 'upcoming' });
};

// Static method to find movies by rating
movieSchema.statics.findByRating = function(rating) {
    return this.find({ 'movieDetails.rating': rating, status: 'upcoming' });
};

// Static method to get movie statistics
movieSchema.statics.getMovieStats = async function() {
    const totalMovies = await this.countDocuments();
    const upcomingMovies = await this.countDocuments({ status: 'upcoming' });
    const totalSeats = await this.aggregate([
        { $unwind: '$showtimes' },
        { $group: { _id: null, total: { $sum: '$showtimes.totalSeats' } } }
    ]);
    
    return {
        totalMovies,
        upcomingMovies,
        totalSeats: totalSeats[0]?.total || 0
    };
};

module.exports = mongoose.model('Movie', movieSchema);
