const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model exists
    required: false // Make it optional for guest users
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  // Add more fields as needed for specific payment gateways
  gatewayResponse: {
    type: Object // Store raw response from payment gateway
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
