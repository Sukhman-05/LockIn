const express = require('express');
const router = express.Router();
const Notebook = require('../models/Notebook');
const { authenticateToken } = require('../middleware/security');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, images, and text files are allowed'));
    }
  }
});

// Get all notebooks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notebooks = await Notebook.find({ userId: req.user.id, isActive: true })
      .sort({ lastAccessed: -1 });
    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
});

// Create a new notebook
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, subject, course, color } = req.body;
    
    const notebook = new Notebook({
      userId: req.user.id,
      title,
      description,
      subject,
      course,
      color: color || '#3B82F6'
    });

    await notebook.save();
    res.status(201).json(notebook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notebook' });
  }
});

// Get a specific notebook with all content
router.get('/:notebookId', authenticateToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Update last accessed
    notebook.lastAccessed = new Date();
    await notebook.save();
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notebook' });
  }
});

// Upload content to notebook
router.post('/:notebookId/content', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const { title, type, content, tags, importance } = req.body;
    
    let filePath = null;
    let fileSize = null;
    
    if (req.file) {
      filePath = req.file.path;
      fileSize = req.file.size;
    }
    
    const contentItem = {
      title,
      type: type || 'text',
      content: content || '',
      filePath,
      fileSize,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      importance: importance || 'medium'
    };
    
    // If it's a PDF or text file, extract content for AI processing
    if (req.file && (req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('text'))) {
      // For now, we'll store the file path and process it later
      // In a full implementation, you'd extract text from PDFs here
      contentItem.content = `File uploaded: ${req.file.originalname}`;
    }
    
    notebook.content.push(contentItem);
    notebook.stats.contentItems = notebook.content.length;
    
    await notebook.save();
    res.json(contentItem);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
});

// AI-powered content analysis
router.post('/:notebookId/content/:contentId/analyze', authenticateToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const contentItem = notebook.content.id(req.params.contentId);
    if (!contentItem) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Analyze this study content and provide insights:
    
    Title: ${contentItem.title}
    Content: ${contentItem.content}
    Type: ${contentItem.type}
    Tags: ${contentItem.tags.join(', ')}
    
    Please provide:
    1. A concise summary (2-3 sentences)
    2. Key concepts and keywords
    3. Related topics or connections
    4. Study suggestions or questions
    
    Return as JSON:
    {
      "summary": "summary text",
      "keywords": ["keyword1", "keyword2"],
      "connections": ["connection1"],
      "suggestions": ["suggestion1"],
      "questions": ["question1"]
    }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const aiResponse = JSON.parse(text);
    
    // Update content item with AI analysis
    contentItem.aiSummary = aiResponse.summary;
    contentItem.aiKeywords = aiResponse.keywords;
    
    // Add insights to notebook
    notebook.insights.push({
      type: 'summary',
      content: aiResponse.summary,
      relatedContent: [contentItem._id.toString()],
      timestamp: new Date()
    });
    
    await notebook.save();
    res.json(aiResponse);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

// Create a new conversation in notebook
router.post('/:notebookId/conversations', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const conversation = {
      title: title || 'New Conversation',
      messages: [],
      isActive: true
    };
    
    notebook.conversations.push(conversation);
    notebook.stats.conversations = notebook.conversations.length;
    
    await notebook.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message in conversation (NotebookLM-style)
router.post('/:notebookId/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const conversation = notebook.conversations.id(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Prepare context from notebook content for AI
    const contextContent = notebook.content
      .map(item => `${item.title}: ${item.content}`)
      .join('\n\n');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    You are an AI study assistant helping a student with their notebook. 
    The student has uploaded the following content to their notebook:
    
    ${contextContent}
    
    The student is asking: ${message}
    
    Please provide a helpful response that:
    1. References specific content from their notebook when relevant
    2. Provides clear explanations and examples
    3. Suggests related topics or questions for further study
    4. Maintains a supportive and encouraging tone
    
    Keep your response concise but comprehensive.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
    
    conversation.lastMessageAt = new Date();
    notebook.lastAccessed = new Date();
    
    await notebook.save();
    res.json({
      userMessage: conversation.messages[conversation.messages.length - 2],
      aiResponse: conversation.messages[conversation.messages.length - 1]
    });
  } catch (error) {
    console.error('AI conversation error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation messages
router.get('/:notebookId/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const conversation = notebook.conversations.id(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update study preferences
router.patch('/:notebookId/preferences', authenticateToken, async (req, res) => {
  try {
    const { studyPreferences } = req.body;
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    notebook.studyPreferences = { ...notebook.studyPreferences, ...studyPreferences };
    await notebook.save();
    
    res.json(notebook.studyPreferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get notebook insights and analytics
router.get('/:notebookId/insights', authenticateToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const insights = {
      stats: notebook.stats,
      recentInsights: notebook.insights.slice(-5),
      contentBreakdown: {
        total: notebook.content.length,
        byType: notebook.content.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {}),
        byImportance: notebook.content.reduce((acc, item) => {
          acc[item.importance] = (acc[item.importance] || 0) + 1;
          return acc;
        }, {})
      },
      studyPatterns: {
        lastAccessed: notebook.lastAccessed,
        totalStudyTime: notebook.stats.totalStudyTime,
        averageSessionTime: notebook.stats.totalStudyTime / Math.max(notebook.stats.conversations, 1)
      }
    };
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Delete notebook
router.delete('/:notebookId', authenticateToken, async (req, res) => {
  try {
    const notebook = await Notebook.findOneAndDelete({ 
      _id: req.params.notebookId, 
      userId: req.user.id 
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
});

module.exports = router; 