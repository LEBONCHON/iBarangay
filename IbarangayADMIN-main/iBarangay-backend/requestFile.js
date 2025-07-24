const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['cart', 'pending', 'approved', 'rejected'], default: 'cart' }, // <-- FIXED LINE
  dateRequested: { type: Date, default: Date.now },
  dateProcessed: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  files: { type: mongoose.Schema.Types.Mixed } // store file info for uploads
  // All other submitted fields will be saved automatically!
}, { strict: false }); // Allows storage of any field

module.exports = mongoose.model('Request', RequestSchema);