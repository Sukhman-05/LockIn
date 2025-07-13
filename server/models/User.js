const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  totalFocusTime: { type: Number, default: 0 }, // in seconds
  badges: [{ type: String }],
  lastSessionDate: { type: Date },
  timezone: { type: String, default: 'UTC' },
  preferences: {
    focusDuration: { type: Number, default: 25 }, // minutes
    breakDuration: { type: Number, default: 5 }, // minutes
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
UserSchema.methods.calculateLevel = function() {
  return Math.floor(this.xp / 100) + 1;
};

// Add XP and update level
UserSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.level = this.calculateLevel();
  return this.save();
};

// Update streak
UserSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastSession = this.lastSessionDate;
  
  if (!lastSession) {
    this.streak = 1;
  } else {
    const daysDiff = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      this.streak += 1;
    } else if (daysDiff > 1) {
      this.streak = 1;
    }
  }
  
  this.lastSessionDate = today;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 