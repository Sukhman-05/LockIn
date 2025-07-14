const request = require('supertest');
const { app } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');

describe('Chatbot API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      xp: 150,
      level: 2,
      streak: 5,
      totalFocusTime: 3600
    });
    await testUser.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/chatbot/stats', () => {
    it('should return user study statistics', async () => {
      const response = await request(app)
        .get('/api/chatbot/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalFocusTime');
      expect(response.body).toHaveProperty('averageSessionLength');
      expect(response.body).toHaveProperty('currentStreak');
      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('xp');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/chatbot/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/chatbot/motivation', () => {
    it('should return motivational message', async () => {
      const response = await request(app)
        .get('/api/chatbot/motivation')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('todayFocusTime');
      expect(response.body).toHaveProperty('currentStreak');
    });
  });

  describe('GET /api/chatbot/reminders', () => {
    it('should return study reminders', async () => {
      const response = await request(app)
        .get('/api/chatbot/reminders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reminders');
      expect(Array.isArray(response.body.reminders)).toBe(true);
    });
  });

  describe('GET /api/chatbot/tips', () => {
    it('should return personalized study tips', async () => {
      const response = await request(app)
        .get('/api/chatbot/tips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tips');
      expect(Array.isArray(response.body.tips)).toBe(true);
      expect(response.body.tips.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/chatbot/tasks', () => {
    it('should accept task list', async () => {
      const tasks = [
        'Review notes from today',
        'Complete practice problems',
        'Read assigned chapters'
      ];

      const response = await request(app)
        .post('/api/chatbot/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('taskCount');
      expect(response.body.taskCount).toBe(3);
    });

    it('should reject invalid task format', async () => {
      const response = await request(app)
        .post('/api/chatbot/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: 'not an array' });

      expect(response.status).toBe(400);
    });
  });
}); 