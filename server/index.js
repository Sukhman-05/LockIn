require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lockin';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const authRouter = require('./routes/auth');
const sessionRouter = require('./routes/session');
const leaderboardRouter = require('./routes/leaderboard');
const podRouter = require('./routes/pod');
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/pods', podRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Socket.io setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join_pod', (podCode) => {
    socket.join(podCode);
  });
  socket.on('timer_update', ({ podCode, timer }) => {
    socket.to(podCode).emit('timer_update', timer);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };
