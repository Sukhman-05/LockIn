const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  hp: { type: Number, default: 100 }, // Health points, min 0
  streak: { type: Number, default: 0 },
  streakHistory: [{ type: Date }], // Array of dates for streak calendar
  totalFocusTime: { type: Number, default: 0 }, // in seconds
  badges: [{ type: String }],
  lastSessionDate: { type: Date },
  lastLoginDate: { type: Date }, // For daily streak logic
  timezone: { type: String, default: 'UTC' },
  preferences: {
    focusDuration: { type: Number, default: 25 }, // minutes
    breakDuration: { type: Number, default: 5 }, // minutes
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
  },
  portrait: { type: String, default: '/Character1.png' },
  background: { type: String, default: '#6b4423' }, // or your Portrait 1 color
  totalSessions: { type: Number, default: 0 } // Number of completed study sessions for session-based calendar
}, { timestamps: true });

// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ lastLoginDate: 1 });
UserSchema.index({ email: 1, password: 1 }); // Compound index for login queries
UserSchema.index({ streak: -1 }); // For leaderboard queries
UserSchema.index({ createdAt: -1 }); // For user analytics

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