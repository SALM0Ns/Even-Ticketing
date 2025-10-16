const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  eventType: { 
    type: String, 
    enum: ['Movie', 'StagePlay', 'LiveOrchestra'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  pricingType: { 
    type: String, 
    default: 'regular' 
  },
  seatInfo: {
    seatNumber: String,
    section: String,
    row: String,
    seat: String
  },
  ticketDetails: {
    category: String,
    eventName: String,
    eventDate: Date,
    venue: String,
    organizer: String
  },
  ticketNumber: { 
    type: String, 
    required: true 
  },
  qrCode: { 
    type: String, 
    required: true 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'used', 'expired'],
    default: 'active' 
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  }
});

// ✅ Auto-generate ticketNumber & qrCode before validating
TicketSchema.pre('validate', function(next) {
  // ถ้ายังไม่มี ticketNumber → สร้างใหม่
  if (!this.ticketNumber) {
    this.ticketNumber = 'T' + Date.now().toString().slice(-6);
  }

  // ถ้ายังไม่มี qrCode → สร้างใหม่ (mock)
  if (!this.qrCode) {
    this.qrCode = `QR-${this.ticketNumber}`;
  }

  next();
});

// Static method to get tickets for multiple events
TicketSchema.statics.getTicketsForEvents = function(eventIds) {
  return this.find({ event: { $in: eventIds } })
    .populate('event')
    .populate('user', 'name email');
};

module.exports = mongoose.model('Ticket', TicketSchema);