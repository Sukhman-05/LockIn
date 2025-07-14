const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Register
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', loginValidation, validate, async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Simplified streak logic for better performance
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let streakUpdated = false;
    
    // Only update streak if it's a new day
    if (!user.lastLoginDate || today > new Date(user.lastLoginDate.getFullYear(), user.lastLoginDate.getMonth(), user.lastLoginDate.getDate())) {
      if (user.lastLoginDate) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastLoginDay = new Date(user.lastLoginDate.getFullYear(), user.lastLoginDate.getMonth(), user.lastLoginDate.getDate());
        
        if (yesterday.getTime() === lastLoginDay.getTime()) {
          // Yesterday login, increment streak
          user.streak += 1;
        } else {
          // Missed a day, reset streak
          user.streak = 1;
        }
      } else {
        // First login
        user.streak = 1;
      }
      user.streakHistory.push(today);
      streakUpdated = true;
    }
    
    user.lastLoginDate = now;
    
    // Use updateOne for better performance instead of save()
    await User.updateOne(
      { _id: user._id },
      { 
        lastLoginDate: now,
        streak: user.streak,
        $push: { streakHistory: today }
      }
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const responseTime = Date.now() - startTime;
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        streak: user.streak,
        hp: user.hp,
        streakHistory: user.streakHistory,
      },
      streakUpdated,
      responseTime
    });
  } catch (err) {
    const responseTime = Date.now() - startTime;
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

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

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('username email xp level portrait createdAt lastLoginDate streak hp');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user portrait
router.patch('/me', auth, async (req, res) => {
  try {
    const { portrait, background } = req.body;
    const user = await User.findById(req.user);
    if (portrait) user.portrait = portrait;
    if (background) user.background = background;
    await user.save();
    res.json({ portrait: user.portrait, background: user.background });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 