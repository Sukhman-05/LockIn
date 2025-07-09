const express = require('express');
const Pod = require('../models/Pod');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

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

// Create a pod
router.post('/', auth, async (req, res) => {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pod = new Pod({ code, users: [req.user], createdBy: req.user });
    await pod.save();
    res.status(201).json(pod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Join a pod by code
router.post('/join', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const pod = await Pod.findOne({ code });
    if (!pod) return res.status(404).json({ error: 'Pod not found' });
    if (!pod.users.includes(req.user)) {
      pod.users.push(req.user);
      await pod.save();
    }
    res.json(pod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get pod info
router.get('/:code', auth, async (req, res) => {
  try {
    const pod = await Pod.findOne({ code: req.params.code }).populate('users', 'username');
    if (!pod) return res.status(404).json({ error: 'Pod not found' });
    res.json(pod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 