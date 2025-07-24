const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  action: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
