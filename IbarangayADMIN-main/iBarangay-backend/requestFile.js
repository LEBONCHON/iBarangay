const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  documentType: { type: String, enum: ['Barangay ID', 'Certificate', 'Clearance'] },
  purpose: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  dateRequested: { type: Date, default: Date.now },
  dateProcessed: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Request', RequestSchema);
