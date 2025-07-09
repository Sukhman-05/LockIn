const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const top = await User.find()
      .select('username xp level')
      .sort({ xp: -1, level: -1 })
      .limit(10);
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 