const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  message: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: true }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
