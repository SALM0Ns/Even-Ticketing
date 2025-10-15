const mongoose = require('mongoose');

const stagePlaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Play name is required'],
        trim: true,
        maxlength: [100, 'Play name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Play description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        default: '/images/default-stage-play.jpg'
    },
    date: {
        type: Date,
        required: [true, 'Performance date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    showDates: [{
        date: {
            type: Date,
            required: true
        },
        seating: {
            totalSeats: {
                type: Number,
                default: 150
            },
            takenSeats: [{
                type: Number
            }],
            availableSeats: {
                type: Number,
                default: 150
            }
        }
    }],
    // Legacy seating for backward compatibility
    seating: {
        totalSeats: {
            type: Number,
            default: 150
        },
        takenSeats: [{
            type: Number
        }],
        availableSeats: {
            type: Number,
            default: 150
        }
    },
    performances: [{
        date: {
            type: Date,
            required: true
        },
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
    stagePlayDetails: {
        playwright: {
            type: String,
            required: [true, 'Playwright is required']
        },
        cast: [{
            name: {
                type: String,
                required: true
            },
            role: {
                type: String,
                required: true
            }
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
        intermission: {
            type: Boolean,
            default: true
        },
        intermissionDuration: {
            type: Number,
            default: 15 // minutes
        },
        ageRestriction: {
            type: String,
            enum: ['All Ages', '13+', '16+', '18+', '21+'],
            default: 'All Ages'
        },
        language: {
            type: String,
            required: [true, 'Language is required']
        },
        originalYear: {
            type: Number,
            required: [true, 'Original year is required']
        },
        awards: [String],
        reviews: [{
            source: String,
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String
        }]
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
        hasBalcony: {
            type: Boolean,
            default: false
        },
        hasOrchestra: {
            type: Boolean,
            default: false
        },
        hasMezzanine: {
            type: Boolean,
            default: false
        },
        hasBoxSeats: {
            type: Boolean,
            default: false
        },
        hasAccessibility: {
            type: Boolean,
            default: false
        },
        hasHearingAssistance: {
            type: Boolean,
            default: false
        },
        hasFoodService: {
            type: Boolean,
            default: false
        },
        hasMerchandise: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true,
    collection: 'StagePlays' // Use your existing 'StagePlays' collection
});

// Indexes for better performance
stagePlaySchema.index({ date: 1 });
stagePlaySchema.index({ organizer: 1 });
stagePlaySchema.index({ status: 1 });
stagePlaySchema.index({ 'location.city': 1 });
stagePlaySchema.index({ 'stagePlayDetails.genre': 1 });

// Virtual for checking if play is sold out
stagePlaySchema.virtual('isSoldOut').get(function() {
    return this.performances.every(performance => performance.availableSeats === 0);
});

// Virtual for checking if play is starting soon (within 24 hours)
stagePlaySchema.virtual('isStartingSoon').get(function() {
    const now = new Date();
    const playTime = new Date(this.date);
    const timeDiff = playTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
});

// Method to get category display name
stagePlaySchema.methods.getCategoryDisplayName = function() {
    return 'Stage Plays';
};

// Method to get category icon
stagePlaySchema.methods.getCategoryIcon = function() {
    return 'fas fa-theater-masks';
};

// Method to get category color
stagePlaySchema.methods.getCategoryColor = function() {
    return 'success';
};

// Method to get available performances
stagePlaySchema.methods.getAvailablePerformances = function() {
    return this.performances.filter(performance => performance.availableSeats > 0);
};

// Method to book seats for a specific performance
stagePlaySchema.methods.bookSeats = function(performanceIndex, numberOfSeats) {
    if (performanceIndex >= 0 && performanceIndex < this.performances.length) {
        const performance = this.performances[performanceIndex];
        if (performance.availableSeats >= numberOfSeats) {
            performance.availableSeats -= numberOfSeats;
            return true;
        }
    }
    return false;
};

// Method to get total duration including intermission
stagePlaySchema.methods.getTotalDuration = function() {
    let totalDuration = this.stagePlayDetails.duration;
    if (this.stagePlayDetails.intermission) {
        totalDuration += this.stagePlayDetails.intermissionDuration;
    }
    return totalDuration;
};

// Pre-save middleware to update status based on date
stagePlaySchema.pre('save', function(next) {
    const now = new Date();
    if (this.date <= now) {
        this.status = 'ended';
    } else if (this.date <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        this.status = 'ongoing';
    }
    next();
});

// Static method to find plays by genre
stagePlaySchema.statics.findByGenre = function(genre) {
    return this.find({ 'stagePlayDetails.genre': genre, status: 'upcoming' });
};

// Static method to find plays by age restriction
stagePlaySchema.statics.findByAgeRestriction = function(ageRestriction) {
    return this.find({ 'stagePlayDetails.ageRestriction': ageRestriction, status: 'upcoming' });
};

// Static method to get stage play statistics
stagePlaySchema.statics.getStagePlayStats = async function() {
    const totalPlays = await this.countDocuments();
    const upcomingPlays = await this.countDocuments({ status: 'upcoming' });
    const totalSeats = await this.aggregate([
        { $unwind: '$performances' },
        { $group: { _id: null, total: { $sum: '$performances.totalSeats' } } }
    ]);
    
    return {
        totalPlays,
        upcomingPlays,
        totalSeats: totalSeats[0]?.total || 0
    };
};

module.exports = mongoose.model('StagePlays', stagePlaySchema);
