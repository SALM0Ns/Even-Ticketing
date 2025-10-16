const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
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
      unique: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  },
  notes: {
    type: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      default: 'website'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries (orderNumber already has unique: true)
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ expiresAt: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `CT${Date.now().toString().slice(-8)}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to generate ticket IDs
orderSchema.pre('save', function(next) {
  if (this.isModified('tickets')) {
    this.tickets.forEach(ticket => {
      if (!ticket.ticketId) {
        ticket.ticketId = `TKT${Date.now().toString().slice(-10)}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }
    });
  }
  next();
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.pricing.total);
});

// Virtual for ticket count
orderSchema.virtual('ticketCount').get(function() {
  return this.tickets.length;
});

// Method to calculate pricing
orderSchema.methods.calculatePricing = function() {
  const subtotal = this.tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% service fee
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const total = subtotal + serviceFee + tax;

  this.pricing = {
    subtotal,
    serviceFee,
    tax,
    total
  };

  return this.pricing;
};

// Method to confirm order
orderSchema.methods.confirm = function() {
  this.orderStatus = 'confirmed';
  return this.save();
};

// Method to mark as paid
orderSchema.methods.markAsPaid = function() {
  this.orderStatus = 'paid';
  this.paymentStatus = 'completed';
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancel = function(reason) {
  this.orderStatus = 'cancelled';
  this.notes = reason;
  return this.save();
};

// Static method to find expired orders
orderSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    orderStatus: 'pending'
  });
};

module.exports = mongoose.model('Order', orderSchema);
