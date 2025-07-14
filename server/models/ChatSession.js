const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  context: {
    userStats: {
      level: Number,
      xp: Number,
      currentStreak: Number,
      totalFocusTime: Number,
      averageSessionLength: Number
    },
    studyPreferences: {
      subjects: [String],
      preferredTechniques: [String],
      goals: [String]
    },
    sessionInfo: {
      startTime: Date,
      lastActivity: Date,
      totalMessages: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
chatSessionSchema.index({ user: 1, sessionId: 1 });
chatSessionSchema.index({ user: 1, isActive: 1 });
chatSessionSchema.index({ 'context.sessionInfo.lastActivity': 1 });

// Method to add a message
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
  
  this.context.sessionInfo.lastActivity = new Date();
  this.context.sessionInfo.totalMessages = this.messages.length;
  
  // Keep only last 50 messages to prevent bloat
  if (this.messages.length > 50) {
    this.messages = this.messages.slice(-50);
  }
  
  return this.save();
};

// Method to update user stats
chatSessionSchema.methods.updateUserStats = function(stats) {
  this.context.userStats = {
    level: stats.level || this.context.userStats.level,
    xp: stats.xp || this.context.userStats.xp,
    currentStreak: stats.currentStreak || this.context.userStats.currentStreak,
    totalFocusTime: stats.totalFocusTime || this.context.userStats.totalFocusTime,
    averageSessionLength: stats.averageSessionLength || this.context.userStats.averageSessionLength
  };
  
  return this.save();
};

// Method to update study preferences
chatSessionSchema.methods.updateStudyPreferences = function(preferences) {
  this.context.studyPreferences = {
    ...this.context.studyPreferences,
    ...preferences
  };
  
  return this.save();
};

// Static method to get or create active session
chatSessionSchema.statics.getOrCreateSession = async function(userId, sessionId) {
  let session = await this.findOne({ 
    user: userId, 
    sessionId: sessionId,
    isActive: true 
  });
  
  if (!session) {
    session = new this({
      user: userId,
      sessionId: sessionId,
      context: {
        userStats: {},
        studyPreferences: {
          subjects: [],
          preferredTechniques: [],
          goals: []
        },
        sessionInfo: {
          startTime: new Date(),
          lastActivity: new Date(),
          totalMessages: 0
        }
      }
    });
    await session.save();
  }
  
  return session;
};

// Static method to get recent sessions
chatSessionSchema.statics.getRecentSessions = async function(userId, limit = 5) {
  return this.find({ 
    user: userId, 
    isActive: true 
  })
  .sort({ 'context.sessionInfo.lastActivity': -1 })
  .limit(limit);
};

// Static method to close session
chatSessionSchema.statics.closeSession = async function(userId, sessionId) {
  return this.findOneAndUpdate(
    { user: userId, sessionId: sessionId },
    { isActive: false },
    { new: true }
  );
};

module.exports = mongoose.model('ChatSession', chatSessionSchema); 