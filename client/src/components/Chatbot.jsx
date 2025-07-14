import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../utils/api';

const Chatbot = ({ onAddTasks, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Generate new session ID
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      
      // Test API connectivity first
      setTimeout(async () => {
        try {
          console.log('Testing API connectivity...');
          const testRes = await api.get('/api/test');
          console.log('API test response:', testRes.data);
          
          console.log('Attempting to fetch chatbot stats...');
          const statsRes = await api.get('/chatbot/stats');
          console.log('Stats response:', statsRes.data);
          
          // Generate AI welcome message
          console.log('Attempting to generate welcome message...');
          const welcomeRes = await api.post('/chatbot/chat', {
            message: "Hello! I'm starting a new study session. Please give me a personalized welcome message based on my stats.",
            sessionId: newSessionId
          });
          console.log('Welcome response:', welcomeRes.data);
          
          addBotMessage(welcomeRes.data.message);
          
          // Load session info if it exists
          try {
            const sessionRes = await api.get(`/chatbot/session/${newSessionId}`);
            setSessionInfo(sessionRes.data);
          } catch (error) {
            console.log('No existing session info found');
            // New session, no info to load
          }
        } catch (error) {
          console.error('Chatbot initialization error:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          // Simple fallback welcome message
          addBotMessage("Hi there! I'm your LockIn study buddy! 🎯\n\nWhat would you like to work on today?");
        }
      }, 500);
    }
  }, [isOpen]);

  // Check for reminders periodically
  useEffect(() => {
    if (isOpen) {
      const checkReminders = async () => {
        try {
          const res = await api.get('/chatbot/reminders');
          const reminders = res.data.reminders;
          
          if (reminders.length > 0) {
            const highPriorityReminders = reminders.filter(r => r.priority === 'high');
            if (highPriorityReminders.length > 0) {
              addBotMessage(`🔔 Reminder: ${highPriorityReminders[0].message}`);
            }
          }
        } catch (error) {
          // Silently handle reminder errors
        }
      };

      // Check reminders every 5 minutes
      const interval = setInterval(checkReminders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { type: 'bot', text, timestamp: new Date() }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
  };

  const generateResponse = async (userInput) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    try {
      // Use AI-powered chat endpoint with session management
      const res = await api.post('/chatbot/chat', { 
        message: userInput,
        sessionId: sessionId
      });
      addBotMessage(res.data.message);
      
      // Update session ID if returned
      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      addBotMessage("I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment! 🤖");
    }
    
    setIsTyping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    addUserMessage(userMessage);
    setInput('');
    
    await generateResponse(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestTaskBreakdown = async () => {
    try {
      const res = await api.post('/chatbot/chat', {
        message: "Please suggest some common study tasks that I can add to my task list.",
        sessionId: sessionId
      });
      addBotMessage(res.data.message);
    } catch (error) {
      console.error('Failed to get task suggestions:', error);
      addBotMessage("I'm sorry, I couldn't generate task suggestions right now. Please try again!");
    }
  };

  const updateStudyPreferences = async (preferences) => {
    try {
      await api.put('/chatbot/preferences', {
        sessionId: sessionId,
        preferences: preferences
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const clearChatHistory = async () => {
    try {
      await api.delete(`/chatbot/history/${sessionId}`);
      setMessages([]);
      addBotMessage("Chat history cleared! Starting fresh. 🆕");
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${isOpen ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' : 'w-full h-full'}`}>
      <div className={`bg-pixelGray/95 backdrop-blur-sm border-4 border-pixelYellow rounded-lg shadow-pixel ${isOpen ? 'w-full max-w-md max-h-[80vh]' : 'w-full h-full max-w-4xl mx-auto'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-pixelYellow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pixelYellow rounded-full flex items-center justify-center text-pixelGray font-bold text-lg">
              🤖
            </div>
            <div>
              <h3 className="text-pixelYellow font-pixel text-lg">Study Buddy</h3>
              <p className="text-pixelYellow/70 font-pixel text-xs">Your AI companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-pixelRed hover:text-red-400 font-bold text-xl btn-pixel"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isOpen ? 'max-h-96' : 'h-full'}`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg font-pixel text-sm ${
                  message.type === 'user'
                    ? 'bg-pixelYellow text-pixelGray'
                    : 'bg-pixelGray/80 border-2 border-pixelYellow text-pixelYellow'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-pixelGray/70' : 'text-pixelYellow/70'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-pixelGray/80 border-2 border-pixelYellow rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pixelYellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t-2 border-pixelYellow">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => {
                addUserMessage("I need motivation");
                generateResponse("I need motivation");
              }}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              💪 Motivation
            </button>
            <button
              onClick={() => {
                addUserMessage("Help me organize tasks");
                generateResponse("Help me organize tasks");
              }}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              📋 Organize
            </button>
            <button
              onClick={() => {
                addUserMessage("Study techniques");
                generateResponse("Study techniques");
              }}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              📚 Study Tips
            </button>
            <button
              onClick={suggestTaskBreakdown}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              ➕ Add Tasks
            </button>
            <button
              onClick={clearChatHistory}
              className="px-3 py-1 bg-pixelRed text-white rounded text-xs font-pixel hover:bg-red-600 transition-colors"
              title="Clear chat history"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 bg-pixelGray border-2 border-pixelYellow rounded font-pixel text-pixelYellow placeholder-pixelYellow/50 focus:outline-none focus:border-pixelOrange transition-colors text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 bg-pixelGreen text-pixelGray border-2 border-pixelYellow rounded font-pixel hover:bg-pixelYellow hover:text-pixelGray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 