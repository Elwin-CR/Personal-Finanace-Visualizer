// lib/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Healthcare', 'Other'],
    default: 'Other'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);