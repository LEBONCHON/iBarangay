const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  birthDate: Date,
  gender: String,
  address: String,
  contactNumber: String,
  civilStatus: String,
  occupation: String,
  isVoter: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resident', ResidentSchema);
