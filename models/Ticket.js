const mongoose = require('mongoose');
const QRCode = require('qrcode');

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    pricingType: {
        type: String,
        enum: ['regular', 'student', 'senior', 'vip'],
        default: 'regular'
    },
    seatInfo: {
        section: String,
        row: String,
        seat: String,
        seatNumber: String
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'refunded'],
        default: 'active'
    },
    qrCode: {
        data: String,
        image: String // Base64 encoded QR code image
    },
    // Ticket validation
    validation: {
        isUsed: {
            type: Boolean,
            default: false
        },
        usedAt: Date,
        usedBy: String, // Staff member who validated the ticket
        validationLocation: String
    },
    // Additional ticket details
    ticketDetails: {
        category: String, // movies, stage-plays, orchestra
        eventName: String,
        eventDate: Date,
        venue: String,
        organizer: String
    },
    // Refund information
    refund: {
        isRefundable: {
            type: Boolean,
            default: true
        },
        refundDeadline: Date,
        refundAmount: Number,
        refundReason: String,
        refundDate: Date
    }
}, {
    timestamps: true
});

// Indexes
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ 'validation.isUsed': 1 });

// Virtual for ticket display name
ticketSchema.virtual('displayName').get(function() {
    return `${this.ticketDetails.eventName} - ${this.ticketNumber}`;
});

// Virtual for checking if ticket is valid for use
ticketSchema.virtual('isValid').get(function() {
    return this.status === 'active' && !this.validation.isUsed;
});

// Virtual for checking if ticket can be refunded
ticketSchema.virtual('canBeRefunded').get(function() {
    if (!this.refund.isRefundable || this.status !== 'active') return false;
    if (this.refund.refundDeadline && new Date() > this.refund.refundDeadline) return false;
    return true;
});

// Method to generate unique ticket number
ticketSchema.statics.generateTicketNumber = function() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TK-${timestamp}-${random}`.toUpperCase();
};

// Method to generate QR code data
ticketSchema.methods.generateQRData = function() {
    const qrData = {
        ticketId: this._id.toString(),
        ticketNumber: this.ticketNumber,
        eventId: this.event.toString(),
        userId: this.user.toString(),
        purchaseDate: this.purchaseDate,
        price: this.price,
        status: this.status
    };
    return JSON.stringify(qrData);
};

// Method to generate QR code image
ticketSchema.methods.generateQRCode = async function() {
    try {
        const qrData = this.generateQRData();
        const qrImage = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        this.qrCode = {
            data: qrData,
            image: qrImage
        };
        
        return qrImage;
    } catch (error) {
        throw new Error('Failed to generate QR code: ' + error.message);
    }
};

// Method to validate ticket
ticketSchema.methods.validateTicket = function(validatedBy, location) {
    if (this.status !== 'active') {
        throw new Error('Ticket is not active');
    }
    
    if (this.validation.isUsed) {
        throw new Error('Ticket has already been used');
    }
    
    this.validation.isUsed = true;
    this.validation.usedAt = new Date();
    this.validation.usedBy = validatedBy;
    this.validation.validationLocation = location;
    this.status = 'used';
    
    return this.save();
};

// Method to cancel ticket
ticketSchema.methods.cancelTicket = function(reason) {
    if (this.status !== 'active') {
        throw new Error('Only active tickets can be cancelled');
    }
    
    this.status = 'cancelled';
    this.refund.refundReason = reason;
    this.refund.refundDate = new Date();
    
    return this.save();
};

// Method to refund ticket
ticketSchema.methods.refundTicket = function(amount, reason) {
    if (!this.canBeRefunded) {
        throw new Error('Ticket cannot be refunded');
    }
    
    this.status = 'refunded';
    this.refund.refundAmount = amount;
    this.refund.refundReason = reason;
    this.refund.refundDate = new Date();
    
    return this.save();
};

// Pre-save middleware to generate ticket number and QR code
ticketSchema.pre('save', async function(next) {
    try {
        // Generate ticket number if not provided
        if (!this.ticketNumber) {
            this.ticketNumber = this.constructor.generateTicketNumber();
        }
        
        // Generate QR code if not exists
        if (!this.qrCode || !this.qrCode.data) {
            await this.generateQRCode();
        }
        
        // Set refund deadline (24 hours before event)
        if (this.ticketDetails.eventDate && !this.refund.refundDeadline) {
            const eventDate = new Date(this.ticketDetails.eventDate);
            this.refund.refundDeadline = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to populate ticket details
ticketSchema.pre('save', async function(next) {
    if (this.isNew && this.event) {
        try {
            const Event = mongoose.model('Event');
            const event = await Event.findById(this.event).populate('organizer');
            
            if (event) {
                this.ticketDetails = {
                    category: event.category,
                    eventName: event.name,
                    eventDate: event.date,
                    venue: event.location.name,
                    organizer: event.organizer.name
                };
            }
        } catch (error) {
            // Continue without populating if event not found
        }
    }
    next();
});

// Static method to get user's tickets
ticketSchema.statics.getUserTickets = function(userId, status = null) {
    const query = { user: userId };
    if (status) {
        query.status = status;
    }
    
    return this.find(query)
        .populate('event', 'name date location category image')
        .sort({ purchaseDate: -1 });
};

// Static method to get event tickets
ticketSchema.statics.getEventTickets = function(eventId, status = null) {
    const query = { event: eventId };
    if (status) {
        query.status = status;
    }
    
    return this.find(query)
        .populate('user', 'name email')
        .sort({ purchaseDate: -1 });
};

// Static method to get ticket statistics
ticketSchema.statics.getTicketStats = async function() {
    const totalTickets = await this.countDocuments();
    const activeTickets = await this.countDocuments({ status: 'active' });
    const usedTickets = await this.countDocuments({ status: 'used' });
    const cancelledTickets = await this.countDocuments({ status: 'cancelled' });
    
    const totalRevenue = await this.aggregate([
        { $match: { status: { $in: ['active', 'used'] } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    return {
        totalTickets,
        activeTickets,
        usedTickets,
        cancelledTickets,
        totalRevenue: totalRevenue[0]?.total || 0
    };
};

module.exports = mongoose.model('Ticket', ticketSchema);
