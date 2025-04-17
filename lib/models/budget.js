// lib/models/Budget.js
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Healthcare', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);