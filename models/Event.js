const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [100, 'Event name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: {
            values: ['movies', 'stage-plays', 'orchestra'],
            message: 'Category must be movies, stage-plays, or orchestra'
        }
    },
    image: {
        type: String,
        default: '/images/default-event.jpg'
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Event date must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: function() {
            return this.category === 'movies' || this.category === 'stage-plays';
        }
    },
    location: {
        name: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Venue address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        capacity: {
            type: Number,
            required: [true, 'Venue capacity is required'],
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
    totalTickets: {
        type: Number,
        required: [true, 'Total tickets is required'],
        min: [1, 'Must have at least 1 ticket']
    },
    availableTickets: {
        type: Number,
        required: [true, 'Available tickets is required'],
        min: [0, 'Available tickets cannot be negative']
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
    // Category-specific fields
    movieDetails: {
        director: String,
        cast: [String],
        genre: [String],
        duration: Number, // in minutes
        rating: {
            type: String,
            enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
        },
        language: String,
        subtitles: Boolean
    },
    stagePlayDetails: {
        playwright: String,
        cast: [String],
        genre: [String],
        duration: Number, // in minutes
        intermission: Boolean,
        ageRestriction: String,
        language: String
    },
    orchestraDetails: {
        conductor: String,
        performers: [String],
        repertoire: [String],
        duration: Number, // in minutes
        intermission: Boolean,
        dressCode: String,
        program: String
    },
    // Seating information
    seating: {
        hasSeating: {
            type: Boolean,
            default: false
        },
        seatingChart: String, // URL to seating chart image
        sections: [{
            name: String,
            price: Number,
            capacity: Number,
            available: Number
        }]
    },
    // Additional features
    features: {
        hasParking: {
            type: Boolean,
            default: false
        },
        hasFood: {
            type: Boolean,
            default: false
        },
        hasMerchandise: {
            type: Boolean,
            default: false
        },
        accessibility: {
            wheelchairAccessible: {
                type: Boolean,
                default: false
            },
            hearingAssistance: {
                type: Boolean,
                default: false
            },
            visualAssistance: {
                type: Boolean,
                default: false
            }
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'location.city': 1 });

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
    return this.availableTickets === 0;
});

// Virtual for checking if event is starting soon (within 24 hours)
eventSchema.virtual('isStartingSoon').get(function() {
    const now = new Date();
    const eventTime = new Date(this.date);
    const timeDiff = eventTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
});

// Method to get category display name
eventSchema.methods.getCategoryDisplayName = function() {
    const categoryNames = {
        'movies': 'Movies',
        'stage-plays': 'Stage Plays',
        'orchestra': 'Live Orchestra'
    };
    return categoryNames[this.category] || this.category;
};

// Method to get category icon
eventSchema.methods.getCategoryIcon = function() {
    const categoryIcons = {
        'movies': 'fas fa-film',
        'stage-plays': 'fas fa-theater-masks',
        'orchestra': 'fas fa-music'
    };
    return categoryIcons[this.category] || 'fas fa-calendar';
};

// Method to get category color
eventSchema.methods.getCategoryColor = function() {
    const categoryColors = {
        'movies': 'primary',
        'stage-plays': 'success',
        'orchestra': 'warning'
    };
    return categoryColors[this.category] || 'secondary';
};

// Pre-save middleware to update available tickets
eventSchema.pre('save', function(next) {
    if (this.isNew) {
        this.availableTickets = this.totalTickets;
    }
    next();
});

// Pre-save middleware to update status based on date
eventSchema.pre('save', function(next) {
    const now = new Date();
    if (this.date <= now) {
        this.status = 'ended';
    } else if (this.date <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        this.status = 'ongoing';
    }
    next();
});

module.exports = mongoose.model('Event', eventSchema);
