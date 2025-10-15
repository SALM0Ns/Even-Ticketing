const mongoose = require('mongoose');

const liveOrchestraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Concert name is required'],
        trim: true,
        maxlength: [100, 'Concert name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Concert description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        default: '/images/default-orchestra.jpg'
    },
    date: {
        type: Date,
        required: [true, 'Concert date is required']
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
                default: 100
            },
            takenSeats: [{
                type: Number
            }],
            availableSeats: {
                type: Number,
                default: 100
            }
        }
    }],
    // Legacy seating for backward compatibility
    seating: {
        totalSeats: {
            type: Number,
            default: 100
        },
        takenSeats: [{
            type: Number
        }],
        availableSeats: {
            type: Number,
            default: 100
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
    orchestraDetails: {
        conductor: {
            type: String,
            required: [true, 'Conductor is required']
        },
        orchestra: {
            type: String,
            required: [true, 'Orchestra name is required']
        },
        performers: [{
            name: {
                type: String,
                required: true
            },
            instrument: {
                type: String,
                required: true
            },
            isSoloist: {
                type: Boolean,
                default: false
            }
        }],
        repertoire: [{
            composer: {
                type: String,
                required: true
            },
            piece: {
                type: String,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            movement: {
                type: String,
                default: null
            }
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
            default: 20 // minutes
        },
        dressCode: {
            type: String,
            enum: ['Casual', 'Smart Casual', 'Business Casual', 'Formal', 'Black Tie'],
            default: 'Smart Casual'
        },
        program: {
            type: String,
            required: [true, 'Program description is required']
        },
        season: {
            type: String,
            required: [true, 'Concert season is required']
        },
        series: {
            type: String,
            default: null
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
    // Venue-specific features
    venueFeatures: {
        hasBalcony: {
            type: Boolean,
            default: false
        },
        hasOrchestra: {
            type: Boolean,
            default: true
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
        hasVisualAssistance: {
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
        },
        hasCoatCheck: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true,
    collection: 'LiveOrchestra' // Use your existing 'LiveOrchestra' collection
});

// Indexes for better performance
liveOrchestraSchema.index({ date: 1 });
liveOrchestraSchema.index({ organizer: 1 });
liveOrchestraSchema.index({ status: 1 });
liveOrchestraSchema.index({ 'location.city': 1 });
liveOrchestraSchema.index({ 'orchestraDetails.orchestra': 1 });

// Virtual for checking if concert is sold out
liveOrchestraSchema.virtual('isSoldOut').get(function() {
    return this.performances.every(performance => performance.availableSeats === 0);
});

// Virtual for checking if concert is starting soon (within 24 hours)
liveOrchestraSchema.virtual('isStartingSoon').get(function() {
    const now = new Date();
    const concertTime = new Date(this.date);
    const timeDiff = concertTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
});

// Method to get category display name
liveOrchestraSchema.methods.getCategoryDisplayName = function() {
    return 'Live Orchestra';
};

// Method to get category icon
liveOrchestraSchema.methods.getCategoryIcon = function() {
    return 'fas fa-music';
};

// Method to get category color
liveOrchestraSchema.methods.getCategoryColor = function() {
    return 'warning';
};

// Method to get available performances
liveOrchestraSchema.methods.getAvailablePerformances = function() {
    return this.performances.filter(performance => performance.availableSeats > 0);
};

// Method to book seats for a specific performance
liveOrchestraSchema.methods.bookSeats = function(performanceIndex, numberOfSeats) {
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
liveOrchestraSchema.methods.getTotalDuration = function() {
    let totalDuration = this.orchestraDetails.duration;
    if (this.orchestraDetails.intermission) {
        totalDuration += this.orchestraDetails.intermissionDuration;
    }
    return totalDuration;
};

// Method to get soloists
liveOrchestraSchema.methods.getSoloists = function() {
    return this.orchestraDetails.performers.filter(performer => performer.isSoloist);
};

// Method to get repertoire by composer
liveOrchestraSchema.methods.getRepertoireByComposer = function(composer) {
    return this.orchestraDetails.repertoire.filter(piece => 
        piece.composer.toLowerCase().includes(composer.toLowerCase())
    );
};

// Pre-save middleware to update status based on date
liveOrchestraSchema.pre('save', function(next) {
    const now = new Date();
    if (this.date <= now) {
        this.status = 'ended';
    } else if (this.date <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        this.status = 'ongoing';
    }
    next();
});

// Static method to find concerts by orchestra
liveOrchestraSchema.statics.findByOrchestra = function(orchestra) {
    return this.find({ 'orchestraDetails.orchestra': orchestra, status: 'upcoming' });
};

// Static method to find concerts by composer
liveOrchestraSchema.statics.findByComposer = function(composer) {
    return this.find({ 'orchestraDetails.repertoire.composer': composer, status: 'upcoming' });
};

// Static method to find concerts by season
liveOrchestraSchema.statics.findBySeason = function(season) {
    return this.find({ 'orchestraDetails.season': season, status: 'upcoming' });
};

// Static method to get orchestra statistics
liveOrchestraSchema.statics.getOrchestraStats = async function() {
    const totalConcerts = await this.countDocuments();
    const upcomingConcerts = await this.countDocuments({ status: 'upcoming' });
    const totalSeats = await this.aggregate([
        { $unwind: '$performances' },
        { $group: { _id: null, total: { $sum: '$performances.totalSeats' } } }
    ]);
    
    return {
        totalConcerts,
        upcomingConcerts,
        totalSeats: totalSeats[0]?.total || 0
    };
};

module.exports = mongoose.model('LiveOrchestra', liveOrchestraSchema);
