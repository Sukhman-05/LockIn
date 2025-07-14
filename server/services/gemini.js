const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a model instance
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class GeminiService {
  constructor() {
    // Keep in-memory cache for active sessions
    this.activeSessions = new Map();
  }

  // Create a context-aware prompt for study assistance
  createStudyPrompt(userStats, userMessage, conversationHistory = [], studyPreferences = {}) {
    const stats = userStats || {};
    
    let prompt = `You are an AI Study Buddy for a productivity app called LockIn. Your role is to help students stay motivated, organized, and productive.

User's Current Stats:
- Level: ${stats.level || 1}
- XP: ${stats.xp || 0}
- Current Streak: ${stats.currentStreak || 0} days
- Total Focus Time: ${Math.round((stats.totalFocusTime || 0) / 60)} minutes
- Average Session Length: ${Math.round((stats.averageSessionLength || 0) / 60)} minutes

Study Preferences:
- Subjects: ${studyPreferences.subjects?.join(', ') || 'Not specified'}
- Preferred Techniques: ${studyPreferences.preferredTechniques?.join(', ') || 'Not specified'}
- Goals: ${studyPreferences.goals?.join(', ') || 'Not specified'}

Recent Conversation (last 10 messages):
${conversationHistory.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User's Message: "${userMessage}"

Instructions:
1. Be encouraging and motivational
2. Provide practical study advice
3. Help with task organization and time management
4. Give specific, actionable tips
5. Keep responses concise but helpful (max 3-4 sentences)
6. Use emojis occasionally to keep it friendly
7. If they ask about tasks, suggest adding them to their to-do list
8. If they need motivation, reference their stats and progress
9. Remember their study preferences and goals
10. Build on previous conversations and context

Respond as a helpful study companion:`;

    return prompt;
  }

  // Generate AI response with persistent storage
  async generateResponse(userId, userMessage, userStats = null, sessionId = null) {
    try {
      // Generate session ID if not provided
      if (!sessionId) {
        sessionId = `session_${Date.now()}`;
      }
      
      // Get or create chat session from database
      const chatSession = await ChatSession.getOrCreateSession(userId, sessionId);
      
      // Update user stats if provided
      if (userStats) {
        await chatSession.updateUserStats(userStats);
      }
      
      // Get conversation history from database
      const conversationHistory = chatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Create the prompt with study preferences
      const prompt = this.createStudyPrompt(
        chatSession.context.userStats, 
        userMessage, 
        conversationHistory,
        chatSession.context.studyPreferences
      );
      
      // Generate response from Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Save user message to database
      await chatSession.addMessage('user', userMessage, {
        userStats: JSON.stringify(userStats || {}),
        timestamp: new Date().toISOString()
      });
      
      // Save AI response to database
      await chatSession.addMessage('assistant', text, {
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      });
      
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback to rule-based responses if AI fails
      return this.getFallbackResponse(userMessage);
    }
  }

  // Fallback responses when AI is unavailable
  getFallbackResponse(userMessage) {
    const input = userMessage.toLowerCase();
    
    if (input.includes('motivate') || input.includes('motivation')) {
      return "You're doing amazing! Every minute of focused work brings you closer to your goals. Remember, progress is progress, no matter how small! 💪";
    } else if (input.includes('organize') || input.includes('task')) {
      return "Let's organize your tasks! Try breaking big projects into smaller, manageable pieces. Start with the most important task first! 📋";
    } else if (input.includes('study') || input.includes('learn')) {
      return "Great question! Try the Pomodoro Technique (25-min focused sessions) or active recall methods. What subject are you working on? 📚";
    } else {
      return "I'm here to help with your studies! Ask me about motivation, task organization, study techniques, or time management. What would you like to work on? 🤖";
    }
  }

  // Clear conversation history for a user
  async clearHistory(userId, sessionId = null) {
    if (sessionId) {
      await ChatSession.closeSession(userId, sessionId);
    } else {
      // Close all active sessions for user
      await ChatSession.updateMany(
        { user: userId, isActive: true },
        { isActive: false }
      );
    }
  }

  // Get conversation history for a user
  async getHistory(userId, sessionId = null) {
    if (sessionId) {
      const session = await ChatSession.findOne({ user: userId, sessionId });
      return session ? session.messages : [];
    } else {
      // Get recent sessions
      const sessions = await ChatSession.getRecentSessions(userId);
      return sessions.flatMap(session => session.messages);
    }
  }

  // Update study preferences
  async updateStudyPreferences(userId, sessionId, preferences) {
    const session = await ChatSession.getOrCreateSession(userId, sessionId);
    await session.updateStudyPreferences(preferences);
    return session;
  }

  // Get chat session info
  async getSessionInfo(userId, sessionId) {
    const session = await ChatSession.findOne({ user: userId, sessionId });
    return session ? {
      sessionId: session.sessionId,
      totalMessages: session.context.sessionInfo.totalMessages,
      startTime: session.context.sessionInfo.startTime,
      lastActivity: session.context.sessionInfo.lastActivity,
      userStats: session.context.userStats,
      studyPreferences: session.context.studyPreferences
    } : null;
  }
}

module.exports = new GeminiService(); 