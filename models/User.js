const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['attendee', 'organizer', 'admin'],
        default: 'attendee'
    },
    profile: {
        phone: {
            type: String,
            trim: true
        },
        dateOfBirth: {
            type: Date
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: {
                type: String,
                default: 'USA'
            }
        },
        preferences: {
            categories: [{
                type: String,
                enum: ['movies', 'stage-plays', 'orchestra']
            }],
            notifications: {
                email: {
                    type: Boolean,
                    default: true
                },
                sms: {
                    type: Boolean,
                    default: false
                },
                push: {
                    type: Boolean,
                    default: true
                }
            }
        }
    },
    // For organizers
    organizerProfile: {
        companyName: {
            type: String,
            required: function() {
                return this.role === 'organizer';
            }
        },
        businessLicense: String,
        taxId: String,
        website: String,
        description: String,
        specialties: [{
            type: String,
            enum: ['movies', 'stage-plays', 'orchestra']
        }],
        venues: [{
            name: String,
            address: String,
            capacity: Number,
            facilities: [String]
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes (email already has unique: true)
userSchema.index({ role: 1 });
userSchema.index({ 'profile.preferences.categories': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return this.name;
});

// Virtual for user's age (if dateOfBirth is provided)
userSchema.virtual('age').get(function() {
    if (!this.profile.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Method to check if user is eligible for student/senior pricing
userSchema.methods.getEligiblePricing = function() {
    const age = this.age;
    if (age && age >= 65) {
        return 'senior';
    } else if (age && age >= 13 && age <= 25) {
        return 'student';
    }
    return 'regular';
};

// Method to get user's favorite categories
userSchema.methods.getFavoriteCategories = function() {
    return this.profile.preferences.categories || [];
};

// Method to check if user likes a specific category
userSchema.methods.likesCategory = function(category) {
    return this.profile.preferences.categories.includes(category);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Method to get user statistics (for organizers)
userSchema.methods.getOrganizerStats = async function() {
    if (this.role !== 'organizer') return null;
    
    const Event = mongoose.model('Event');
    const Ticket = mongoose.model('Ticket');
    
    const totalEvents = await Event.countDocuments({ organizer: this._id });
    const activeEvents = await Event.countDocuments({ 
        organizer: this._id, 
        status: { $in: ['upcoming', 'ongoing'] } 
    });
    const totalTicketsSold = await Ticket.countDocuments({ 
        event: { $in: await Event.find({ organizer: this._id }).distinct('_id') }
    });
    
    return {
        totalEvents,
        activeEvents,
        totalTicketsSold
    };
};

// Static method to find users by category preference
userSchema.statics.findByCategoryPreference = function(category) {
    return this.find({
        'profile.preferences.categories': category,
        isActive: true
    });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
    const totalUsers = await this.countDocuments({ isActive: true });
    const totalAttendees = await this.countDocuments({ role: 'attendee', isActive: true });
    const totalOrganizers = await this.countDocuments({ role: 'organizer', isActive: true });
    
    return {
        totalUsers,
        totalAttendees,
        totalOrganizers
    };
};

module.exports = mongoose.model('User', userSchema);
