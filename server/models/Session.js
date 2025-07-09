const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  duration: { type: Number, required: true }, // seconds
  type: { type: String, enum: ['focus', 'break'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema); 