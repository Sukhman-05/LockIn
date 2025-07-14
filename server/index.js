require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { securityHeaders, apiLimiter } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(apiLimiter);

app.use(cors({
  origin: [
    'https://lock-in-gray.vercel.app',
    'https://lockin-emt7.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Trust proxy for correct rate limiting and IP detection
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lockin';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {/* MongoDB connected */})
  .catch(err => {/* MongoDB connection error */});

const authRouter = require('./routes/auth');
const sessionRouter = require('./routes/session');
const leaderboardRouter = require('./routes/leaderboard');
const podRouter = require('./routes/pod');
const chatbotRouter = require('./routes/chatbot');
const taskRouter = require('./routes/tasks');
const notebookRouter = require('./routes/notebooks');
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/pods', podRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/notebooks', notebookRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  const startTime = Date.now();
  
  // Check database connection
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  
  const responseTime = Date.now() - startTime;
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    responseTime: `${responseTime}ms`,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API-only backend - frontend is deployed separately on Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'LockIn API Server', 
    status: 'running',
    endpoints: [
      '/api/auth',
      '/api/sessions', 
      '/api/leaderboard',
      '/api/pods',
      '/api/chatbot',
      '/api/tasks',
      '/api/notebooks'
    ]
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

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
    // Server running
  });
}

module.exports = { app, server };
