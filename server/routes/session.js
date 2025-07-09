const express = require('express');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
router.post('/', auth, async (req, res) => {
  try {
    const { start, end, duration, type } = req.body;
    const session = new Session({
      user: req.user,
      start,
      end,
      duration,
      type,
    });
    await session.save();
    // Award XP for focus sessions
    if (type === 'focus') {
      const user = await User.findById(req.user);
      user.xp += 10;
      // Level up for every 100 XP
      if (user.xp >= user.level * 100) {
        user.level += 1;
      }
      await user.save();
      return res.status(201).json({ session, user: { xp: user.xp, level: user.level } });
    }
    res.status(201).json({ session });
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

module.exports = router; 