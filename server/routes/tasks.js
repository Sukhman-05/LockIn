const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/security');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all tasks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ dueDate: 1, priority: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, estimatedDuration } = req.body;
    
    const task = new Task({
      userId: req.user.id,
      title,
      description,
      category,
      priority,
      dueDate: new Date(dueDate),
      totalEstimatedDuration: estimatedDuration
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// AI-powered task chunking and timeline creation
router.post('/:taskId/plan', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    I need to break down a task into manageable chunks and create a realistic timeline.
    
    Task: ${task.title}
    Description: ${task.description}
    Total estimated duration: ${task.totalEstimatedDuration} minutes
    Due date: ${task.dueDate}
    Priority: ${task.priority}
    
    Please create:
    1. 3-8 manageable chunks with specific titles, descriptions, and time estimates
    2. A realistic timeline considering the user's schedule
    3. Milestones to track progress
    4. Suggestions for optimal scheduling
    
    Return the response as a JSON object with this structure:
    {
      "chunks": [
        {
          "title": "chunk title",
          "description": "detailed description",
          "estimatedDuration": minutes,
          "priority": "low/medium/high"
        }
      ],
      "timeline": {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "milestones": [
          {
            "date": "YYYY-MM-DD",
            "description": "milestone description"
          }
        ]
      },
      "suggestions": [
        "suggestion text"
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const aiResponse = JSON.parse(text);
    
    // Update task with AI-generated chunks and timeline
    task.chunks = aiResponse.chunks.map(chunk => ({
      ...chunk,
      status: 'pending'
    }));
    
    task.timeline = {
      startDate: new Date(aiResponse.timeline.startDate),
      endDate: new Date(aiResponse.timeline.endDate),
      milestones: aiResponse.timeline.milestones.map(milestone => ({
        date: new Date(milestone.date),
        description: milestone.description,
        completed: false
      }))
    };
    
    task.aiSuggestions.push({
      type: 'timeline',
      content: aiResponse.suggestions.join('\n'),
      timestamp: new Date()
    });
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('AI planning error:', error);
    res.status(500).json({ error: 'Failed to create task plan' });
  }
});

// Update task chunk status
router.patch('/:taskId/chunks/:chunkId', authenticateToken, async (req, res) => {
  try {
    const { status, actualDuration } = req.body;
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const chunk = task.chunks.id(req.params.chunkId);
    if (!chunk) {
      return res.status(404).json({ error: 'Chunk not found' });
    }
    
    chunk.status = status;
    if (actualDuration) chunk.actualDuration = actualDuration;
    if (status === 'completed') chunk.completedAt = new Date();
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chunk' });
  }
});

// Get task analytics and insights
router.get('/:taskId/analytics', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const completedChunks = task.chunks.filter(chunk => chunk.status === 'completed');
    const totalActualDuration = completedChunks.reduce((sum, chunk) => sum + (chunk.actualDuration || 0), 0);
    const totalEstimatedDuration = task.chunks.reduce((sum, chunk) => sum + chunk.estimatedDuration, 0);
    
    const analytics = {
      progress: {
        completed: completedChunks.length,
        total: task.chunks.length,
        percentage: Math.round((completedChunks.length / task.chunks.length) * 100)
      },
      timeTracking: {
        actual: totalActualDuration,
        estimated: totalEstimatedDuration,
        variance: totalActualDuration - totalEstimatedDuration
      },
      timeline: {
        startDate: task.timeline?.startDate,
        endDate: task.timeline?.endDate,
        milestones: task.timeline?.milestones || []
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// AI-powered task optimization
router.post('/:taskId/optimize', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Analyze this task and provide optimization suggestions:
    
    Task: ${task.title}
    Current progress: ${task.chunks.filter(c => c.status === 'completed').length}/${task.chunks.length} chunks completed
    Due date: ${task.dueDate}
    Priority: ${task.priority}
    
    Provide suggestions for:
    1. Time management improvements
    2. Priority adjustments
    3. Resource allocation
    4. Potential blockers and solutions
    
    Return as JSON:
    {
      "suggestions": ["suggestion1", "suggestion2"],
      "priorityAdjustments": ["adjustment1"],
      "timeOptimizations": ["optimization1"],
      "riskMitigation": ["risk1"]
    }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const aiResponse = JSON.parse(text);
    
    task.aiSuggestions.push({
      type: 'optimization',
      content: JSON.stringify(aiResponse),
      timestamp: new Date()
    });
    
    await task.save();
    res.json(aiResponse);
  } catch (error) {
    console.error('AI optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize task' });
  }
});

// Delete a task
router.delete('/:taskId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router; 