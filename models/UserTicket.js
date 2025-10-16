const mongoose = require('mongoose');

const userTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest users
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  event: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    eventName: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true,
      enum: ['Movie', 'StagePlays', 'LiveOrchestra', 'movies', 'stage-plays', 'orchestra', 'live-orchestra']
    },
    showDate: {
      type: Date,
      required: true
    },
    venue: {
      name: String,
      address: String,
      city: String
    }
  },
  tickets: [{
    seatNumber: {
      type: String,
      required: true
    },
    seatType: {
      type: String,
      enum: ['standard', 'vip', 'premium'],
      default: 'standard'
    },
    price: {
      type: Number,
      required: true
    },
    ticketId: {
      type: String,
      required: true
    }
  }],
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active'
  },
  qrCode: {
    type: String, // Store QR code data
    required: false
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
userTicketSchema.index({ user: 1 });
userTicketSchema.index({ 'customer.email': 1 });
userTicketSchema.index({ status: 1 });
userTicketSchema.index({ 'event.showDate': 1 });

// Virtual for formatted total
userTicketSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.totalAmount);
});

// Virtual for ticket count
userTicketSchema.virtual('ticketCount').get(function() {
  return this.tickets.length;
});

// Method to mark ticket as used
userTicketSchema.methods.markAsUsed = function() {
  this.status = 'used';
  return this.save();
};

// Method to cancel ticket
userTicketSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason || 'Cancelled by user';
  return this.save();
};

// Static method to find user tickets
userTicketSchema.statics.findUserTickets = function(userId, email) {
  const query = {};
  if (userId) {
    query.user = userId;
  } else if (email) {
    query['customer.email'] = email;
  }
  return this.find(query).sort({ 'event.showDate': -1 });
};

module.exports = mongoose.model('UserTicket', userTicketSchema);
