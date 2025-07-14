const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const geminiService = require('../services/gemini');
const { authenticateToken } = require('../middleware/security');

const router = express.Router();

// Get user's study statistics for personalized responses
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sessions = await Session.find({ 
      user: req.user.id,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const totalFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = sessions.length > 0 ? totalFocusTime / sessions.length : 0;
    const currentStreak = user.streak || 0;

    res.json({
      totalFocusTime,
      averageSessionLength,
      currentStreak,
      totalSessions: sessions.length,
      level: user.level || 1,
      xp: user.xp || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI-powered motivational messages
router.get('/motivation', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sessions = await Session.find({ 
      user: req.user.id,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const todayFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const currentStreak = user.streak || 0;

    // Use AI to generate personalized motivation
    const userStats = {
      level: user.level || 1,
      xp: user.xp || 0,
      currentStreak: currentStreak,
      totalFocusTime: todayFocusTime,
      averageSessionLength: sessions.length > 0 ? todayFocusTime / sessions.length : 0
    };

    const message = await geminiService.generateResponse(
      req.user.id, 
      "Give me motivation to study", 
      userStats
    );

    res.json({ 
      message, 
      type: 'ai_generated', 
      todayFocusTime, 
      currentStreak 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get study session reminders
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sessions = await Session.find({ 
      user: req.user.id,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const todayFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const reminders = [];

    // Use AI to generate personalized reminders based on user's study patterns
    if (todayFocusTime === 0) {
      const aiReminder = await geminiService.generateResponse(
        req.user.id,
        "Generate a motivational reminder to start a study session",
        userStats
      );
      reminders.push({
        type: 'start',
        message: aiReminder,
        priority: 'high'
      });
    } else if (todayFocusTime < 3600) { // Less than 1 hour
      const aiReminder = await geminiService.generateResponse(
        req.user.id,
        "Generate a gentle reminder to continue studying",
        userStats
      );
      reminders.push({
        type: 'continue',
        message: aiReminder,
        priority: 'medium'
      });
    }

    // Check for long breaks
    const lastSession = sessions[sessions.length - 1];
    if (lastSession) {
      const timeSinceLastSession = Date.now() - lastSession.end.getTime();
      const hoursSinceLastSession = timeSinceLastSession / (1000 * 60 * 60);
      
      if (hoursSinceLastSession > 4) {
        const aiReminder = await geminiService.generateResponse(
          req.user.id,
          "Generate a reminder for someone who hasn't studied in several hours",
          userStats
        );
        reminders.push({
          type: 'break',
          message: aiReminder,
          priority: 'medium'
        });
      }
    }

    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save user's tasks (for future reference)
router.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    // For now, we'll just acknowledge the tasks
    // In a full implementation, you might want to store them in a separate collection
    res.json({ 
      message: 'Tasks received',
      taskCount: tasks.length,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI-powered personalized study tips
router.get('/tips', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sessions = await Session.find({ 
      user: req.user.id,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const averageSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length 
      : 0;

    const userStats = {
      level: user.level || 1,
      xp: user.xp || 0,
      currentStreak: user.streak || 0,
      totalFocusTime: sessions.reduce((sum, session) => sum + session.duration, 0),
      averageSessionLength: averageSessionLength,
      sessionCount: sessions.length
    };

    // Use AI to generate personalized tips
    const aiResponse = await geminiService.generateResponse(
      req.user.id,
      "Give me personalized study tips based on my patterns",
      userStats
    );

    res.json({ 
      tips: [{ 
        category: 'ai_generated', 
        tip: aiResponse, 
        reason: "AI-generated based on your study patterns" 
      }] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint for AI-powered chat responses
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user stats for context
    const user = await User.findById(req.user.id);
    const sessions = await Session.find({ 
      user: req.user.id,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const userStats = {
      level: user.level || 1,
      xp: user.xp || 0,
      currentStreak: user.streak || 0,
      totalFocusTime: sessions.reduce((sum, session) => sum + session.duration, 0),
      averageSessionLength: sessions.length > 0 ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length : 0
    };

    // Generate AI response with persistent storage
    const aiResponse = await geminiService.generateResponse(
      req.user.id,
      message,
      userStats,
      sessionId
    );

    res.json({ 
      message: aiResponse,
      timestamp: new Date(),
      type: 'ai_generated',
      sessionId: sessionId || `session_${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat session info
router.get(['/session', '/session/:sessionId'], authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const sessionInfo = await geminiService.getSessionInfo(req.user.id, sessionId);
    
    if (!sessionInfo) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(sessionInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation history
router.get(['/history', '/history/:sessionId'], authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const history = await geminiService.getHistory(req.user.id, sessionId);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update study preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { sessionId, preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Preferences object is required' });
    }
    
    const session = await geminiService.updateStudyPreferences(req.user.id, sessionId, preferences);
    res.json({ 
      message: 'Study preferences updated',
      sessionId: session.sessionId,
      preferences: session.context.studyPreferences
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear conversation history
router.delete(['/history', '/history/:sessionId'], authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    await geminiService.clearHistory(req.user.id, sessionId);
    res.json({ message: 'Conversation history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 