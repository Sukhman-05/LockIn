const mongoose = require('mongoose');

const taskChunkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'paused'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  calendarEventId: {
    type: String // For Google Calendar integration
  }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'paused'],
    default: 'pending'
  },
  totalEstimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  chunks: [taskChunkSchema],
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      date: Date,
      description: String,
      completed: { type: Boolean, default: false }
    }]
  },
  calendarIntegration: {
    googleCalendarId: String,
    notionPageId: String,
    synced: { type: Boolean, default: false }
  },
  tags: [String],
  notes: String,
  aiSuggestions: [{
    type: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Indexes for efficient querying
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Task', taskSchema); 