const express = require('express');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sessionValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Save a session
router.post('/', auth, sessionValidation, validate, async (req, res) => {
  try {
    const session = new Session({
      ...req.body,
      user: req.user
    });
    await session.save();
    
    // Update user stats
      const user = await User.findById(req.user);
    if (req.body.type === 'focus') {
      const minutes = Math.floor(req.body.duration / 60);
      user.xp += minutes;
      user.level = Math.floor(user.xp / 100) + 1;
      user.totalFocusTime += req.body.duration;
      // Update streakHistory for today if not present
      const today = new Date();
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (!user.streakHistory.some(d => new Date(d).getTime() === todayDay.getTime())) {
        user.streakHistory.push(todayDay);
      }
      // Increment totalSessions and handle XP reward/reset
      user.totalSessions = (user.totalSessions || 0) + 1;
      let sessionMilestone = false;
      if (user.totalSessions >= 30) {
        user.xp += 50; // Award 50 XP
        user.level = Math.floor(user.xp / 100) + 1;
        user.totalSessions = 0; // Reset session count
        sessionMilestone = true;
      }
      await user.save();
    }
    
    res.status(201).json({ session, totalSessions: user.totalSessions, sessionMilestone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user }).sort({ start: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      user: req.user,
      type: 'focus',
      start: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Group by day
    const dailyStats = {};
    sessions.forEach(session => {
      const date = session.start.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { focusTime: 0, sessions: 0 };
      }
      dailyStats[date].focusTime += session.duration;
      dailyStats[date].sessions += 1;
    });

    // Convert to array and sort
    const daily = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      focusTime: stats.focusTime,
      sessions: stats.sessions
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ daily });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Decrease HP if user quits mid-session
router.patch('/hp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const loss = req.body.loss || 10;
    user.hp = Math.max(0, user.hp - loss);
    await user.save();
    res.json({ hp: user.hp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Streak calendar for user
router.get('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json({ streak: user.streak, streakHistory: user.streakHistory });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Get user's totalSessions (for session-based calendar)
router.get('/totalsessions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json({ totalSessions: user.totalSessions || 0 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 