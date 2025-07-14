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
      
      // Welcome message with personalized stats
      setTimeout(async () => {
        try {
          const statsRes = await api.get('/chatbot/stats');
          const motivationRes = await api.get('/chatbot/motivation');
          
          const stats = statsRes.data;
          const motivation = motivationRes.data;
          
          let welcomeMessage = "Hi there! I'm your LockIn study buddy! 🎯\n\n";
          welcomeMessage += `📊 Your Stats:\n• Level: ${stats.level}\n• XP: ${stats.xp}\n• Current Streak: ${stats.currentStreak} days\n• This week: ${Math.round(stats.totalFocusTime / 60)} minutes focused\n\n`;
          welcomeMessage += motivation.message + "\n\n";
          welcomeMessage += "I can help you with:\n• Staying motivated during sessions\n• Answering study questions\n• Organizing your tasks\n• Breaking down big projects\n\nWhat would you like to work on today?";
          
          addBotMessage(welcomeMessage);
          
          // Load session info if it exists
          try {
            const sessionRes = await api.get(`/chatbot/session/${newSessionId}`);
            setSessionInfo(sessionRes.data);
          } catch (error) {
            // New session, no info to load
          }
        } catch (error) {
          // Fallback welcome message
          addBotMessage("Hi there! I'm your LockIn study buddy! 🎯\n\nI can help you with:\n• Staying motivated during sessions\n• Answering study questions\n• Organizing your tasks\n• Breaking down big projects\n\nWhat would you like to work on today?");
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
      
      // Fallback to rule-based responses if AI fails
      const input = userInput.toLowerCase();
      
      // Motivation responses
      if (input.includes('motivate') || input.includes('motivation') || input.includes('encourage')) {
        try {
          const res = await api.get('/chatbot/motivation');
          addBotMessage(res.data.message);
        } catch (error) {
          const motivations = [
            "You're doing amazing! Every minute of focused work brings you closer to your goals. Remember, progress is progress, no matter how small! 💪",
            "Think of your future self - they'll thank you for the effort you're putting in right now. You've got this! 🌟",
            "Every expert was once a beginner. You're building the foundation for something great. Keep going! 🚀",
            "Your dedication today is creating the success of tomorrow. Stay focused, stay strong! ⚡",
            "You're not just studying, you're investing in yourself. That's powerful! Keep pushing forward! 💎"
          ];
          addBotMessage(motivations[Math.floor(Math.random() * motivations.length)]);
        }
      }
      
      // Task organization
      else if (input.includes('organize') || input.includes('task') || input.includes('todo') || input.includes('project')) {
        if (input.includes('big') || input.includes('project') || input.includes('overwhelming')) {
          addBotMessage("Let's break this down! 🎯\n\nFor big projects, try this approach:\n\n1. **Brain Dump**: Write down everything you need to do\n2. **Categorize**: Group related tasks together\n3. **Prioritize**: What's most urgent/important?\n4. **Time Estimate**: How long will each task take?\n5. **Schedule**: Spread tasks across realistic time periods\n\nWould you like me to help you break down a specific project?");
        } else {
          addBotMessage("Great! Let's organize your tasks effectively! 📋\n\n**Quick Task Organization Tips:**\n\n• Use the Pomodoro Technique (25-min focused sessions)\n• Group similar tasks together\n• Start with the most challenging task first\n• Break large tasks into smaller, manageable pieces\n• Set realistic deadlines\n\nWould you like me to help you create a specific task list?");
        }
      }
      
      // Study techniques
      else if (input.includes('study') || input.includes('learn') || input.includes('technique') || input.includes('method')) {
        const techniques = [
          "**Active Recall**: Test yourself instead of just re-reading. Try explaining concepts out loud! 🧠\n\n**Spaced Repetition**: Review material at increasing intervals to strengthen memory.\n\n**The Feynman Technique**: Explain complex topics in simple terms.\n\n**Mind Mapping**: Visualize connections between concepts.\n\nWhich technique would you like to try?",
          "**Pomodoro Technique**: 25 minutes of focused work, then 5-minute breaks. Perfect for maintaining concentration! ⏰\n\n**Interleaving**: Mix different subjects/topics instead of studying one thing for hours.\n\n**Elaboration**: Ask 'why' and 'how' questions about what you're learning.\n\n**Self-Testing**: Create practice questions for yourself.\n\nReady to implement any of these?",
          "**Chunking**: Break information into smaller, meaningful groups.\n\n**Visual Learning**: Use diagrams, charts, and mind maps.\n\n**Teaching Others**: Explain concepts to someone else (or even to yourself!).\n\n**Practice Testing**: Regular quizzes and self-assessment.\n\n**Distributed Practice**: Spread study sessions over time.\n\nWhich method interests you most?"
        ];
        addBotMessage(techniques[Math.floor(Math.random() * techniques.length)]);
      }
      
      // Time management
      else if (input.includes('time') || input.includes('schedule') || input.includes('manage') || input.includes('busy')) {
        addBotMessage("Time management is key! Here's a simple approach: ⏰\n\n**Time Blocking Method:**\n\n1. **Audit your time**: Track how you spend your day\n2. **Prioritize ruthlessly**: Focus on what truly matters\n3. **Time block**: Assign specific times to specific tasks\n4. **Buffer time**: Leave room for unexpected events\n5. **Review and adjust**: Reflect on what worked/didn't work\n\n**Pro tip**: Start with your most important task first thing in the morning!\n\nWould you like help creating a daily schedule?");
      }
      
      // Stress and anxiety
      else if (input.includes('stress') || input.includes('anxiety') || input.includes('overwhelm') || input.includes('tired')) {
        const stressResponses = [
          "It's completely normal to feel overwhelmed! Here are some quick stress-busters: 😌\n\n• Take 3 deep breaths\n• Stand up and stretch for 2 minutes\n• Drink some water\n• Remember: you don't have to be perfect\n• Break tasks into smaller pieces\n\nYou're doing great just by showing up!",
          "Stress is your body's way of saying 'I care about this.' That's actually a good thing! 🌸\n\n**Quick Stress Relief:**\n\n• 5-4-3-2-1 grounding technique\n• Progressive muscle relaxation\n• Take a 5-minute walk\n• Listen to calming music\n• Remember: progress over perfection\n\nYou've got this! 💪"
        ];
        addBotMessage(stressResponses[Math.floor(Math.random() * stressResponses.length)]);
      }
      
      // Productivity tips
      else if (input.includes('productive') || input.includes('efficient') || input.includes('focus') || input.includes('distraction')) {
        addBotMessage("Boost your productivity with these proven strategies! 🚀\n\n**Focus Techniques:**\n\n• **Environment**: Clean, quiet, well-lit space\n• **Single-tasking**: One thing at a time\n• **Phone away**: Out of sight, out of mind\n• **Pomodoro**: 25-min focused sessions\n• **Energy management**: Work when you're most alert\n\n**Pro tip**: Track your energy levels throughout the day to find your peak productivity hours!\n\nWhat's your biggest productivity challenge?");
      }
      
      // Help with specific subjects
      else if (input.includes('math') || input.includes('science') || input.includes('history') || input.includes('english') || input.includes('language')) {
        const subjectTips = {
          math: "**Math Study Tips:** 📐\n\n• Practice problems daily\n• Understand concepts before memorizing\n• Use visual aids and diagrams\n• Teach concepts to others\n• Review regularly, not just before tests\n• Break complex problems into steps\n\nWhat specific math topic are you working on?",
          science: "**Science Study Tips:** 🔬\n\n• Understand the scientific method\n• Connect concepts to real-world examples\n• Use diagrams and models\n• Practice explaining concepts simply\n• Review lab procedures carefully\n• Make connections between topics\n\nWhich science subject are you studying?",
          history: "**History Study Tips:** 📚\n\n• Create timelines of events\n• Understand cause and effect\n• Connect events to modern times\n• Use mnemonic devices\n• Focus on themes, not just dates\n• Read primary sources when possible\n\nWhat historical period are you studying?",
          english: "**English Study Tips:** 📖\n\n• Read actively (annotate, question, predict)\n• Practice writing regularly\n• Build vocabulary systematically\n• Analyze writing styles\n• Discuss literature with others\n• Write summaries in your own words\n\nWhat type of English work are you doing?",
          language: "**Language Learning Tips:** 🌍\n\n• Practice daily, even for 10 minutes\n• Immerse yourself (music, movies, books)\n• Speak out loud, even to yourself\n• Use spaced repetition for vocabulary\n• Connect words to images/experiences\n• Don't fear mistakes - they're learning opportunities\n\nWhich language are you learning?"
        };
        
        let subject = 'general';
        if (input.includes('math')) subject = 'math';
        else if (input.includes('science')) subject = 'science';
        else if (input.includes('history')) subject = 'history';
        else if (input.includes('english')) subject = 'english';
        else if (input.includes('language')) subject = 'language';
        
        addBotMessage(subjectTips[subject] || subjectTips.general);
      }
      
      // General help
      else if (input.includes('help') || input.includes('what can you do') || input.includes('capabilities')) {
        addBotMessage("I'm here to be your study companion! Here's what I can help with: 🤖\n\n**🎯 Motivation & Encouragement**\n• Keep you motivated during long study sessions\n• Provide encouragement when you're feeling stuck\n\n**📚 Study Techniques**\n• Share effective learning strategies\n• Help with specific subjects\n• Suggest study methods\n\n**📋 Task Organization**\n• Help break down big projects\n• Organize your to-do list\n• Create realistic schedules\n\n**⏰ Time Management**\n• Suggest productivity techniques\n• Help with scheduling\n• Focus improvement tips\n\n**😌 Stress Management**\n• Quick stress relief techniques\n• Anxiety management strategies\n\nJust ask me anything! What would you like to work on?");
      }
      
      // Default response
      else {
        const defaultResponses = [
          "That's interesting! I'm here to help you stay focused and productive. What specific area would you like to work on? 🤔",
          "I'd love to help you with that! Are you looking for motivation, study tips, task organization, or something else? 💭",
          "Great question! I can help with study techniques, motivation, task management, or stress relief. What's most important to you right now? ✨",
          "I'm here to support your learning journey! Would you like help with staying motivated, organizing tasks, or improving your study techniques? 🎯"
        ];
        addBotMessage(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
      }
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

  const suggestTaskBreakdown = () => {
    addBotMessage("Let me help you create a task list! Here are some common study tasks I can add:\n\n• Review notes from today's session\n• Complete practice problems\n• Read assigned chapters\n• Create study flashcards\n• Review previous material\n• Prepare for upcoming test\n\nWould you like me to add these to your task list, or do you have specific tasks in mind?");
    
    // Add the suggested tasks to the task list
    const suggestedTasks = [
      "Review notes from today's session",
      "Complete practice problems",
      "Read assigned chapters",
      "Create study flashcards",
      "Review previous material",
      "Prepare for upcoming test"
    ];
    
    if (onAddTasks) {
      onAddTasks(suggestedTasks);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-pixelGray/95 backdrop-blur-sm border-4 border-pixelYellow rounded-lg shadow-pixel w-full max-w-md max-h-[80vh] flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
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
                generateResponse("motivation");
              }}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              💪 Motivation
            </button>
            <button
              onClick={() => {
                addUserMessage("Help me organize tasks");
                generateResponse("organize tasks");
              }}
              className="px-3 py-1 bg-pixelYellow text-pixelGray rounded text-xs font-pixel hover:bg-pixelOrange transition-colors"
            >
              📋 Organize
            </button>
            <button
              onClick={() => {
                addUserMessage("Study techniques");
                generateResponse("study techniques");
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