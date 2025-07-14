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
  attachments: [{
    type: String, // file path or URL
    name: String,
    size: Number
  }]
});

const contentItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'pdf', 'image', 'link', 'note'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  filePath: String,
  fileSize: Number,
  tags: [String],
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  aiSummary: String,
  aiKeywords: [String]
}, { timestamps: true });

const notebookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  // Content items (like NotebookLM's source ground)
  content: [contentItemSchema],
  // Chat conversations
  conversations: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Study preferences and settings
  studyPreferences: {
    preferredStudyTime: String, // e.g., "morning", "afternoon", "evening"
    studySessionDuration: {
      type: Number, // in minutes
      default: 25
    },
    breakDuration: {
      type: Number, // in minutes
      default: 5
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      default: 'visual'
    }
  },
  // AI-generated insights
  insights: [{
    type: {
      type: String,
      enum: ['summary', 'question', 'connection', 'reminder', 'suggestion']
    },
    content: String,
    relatedContent: [String], // IDs of related content items
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Tags for organization
  tags: [String],
  // Statistics
  stats: {
    totalStudyTime: {
      type: Number, // in minutes
      default: 0
    },
    contentItems: {
      type: Number,
      default: 0
    },
    conversations: {
      type: Number,
      default: 0
    },
    lastStudySession: Date
  }
}, { timestamps: true });

// Indexes for efficient querying
notebookSchema.index({ userId: 1, isActive: 1 });
notebookSchema.index({ userId: 1, subject: 1 });
notebookSchema.index({ userId: 1, lastAccessed: -1 });

module.exports = mongoose.model('Notebook', notebookSchema); 