# Advanced AI Features for LockIn

## Overview

LockIn now includes two powerful AI-powered features that enhance productivity and learning:

1. **📋 Task Planner** - AI-powered task organization and timeline planning
2. **📚 Study Notebooks** - NotebookLM-style study assistant with content management

## 📋 Task Planner

### Features

- **AI-Powered Task Chunking**: Break large tasks into manageable chunks
- **Smart Timeline Creation**: Generate realistic timelines based on task complexity
- **Progress Tracking**: Monitor completion and adjust timelines
- **Priority Management**: Organize tasks by urgency and importance
- **Analytics Dashboard**: Track productivity and time management

### How to Use

1. **Create a Task**:
   - Click "Create New Task"
   - Fill in title, description, category, priority, due date, and estimated duration
   - Submit to create the task

2. **AI Planning**:
   - Click "🤖 AI Plan Task" on any task
   - AI will automatically:
     - Break the task into 3-8 manageable chunks
     - Create a realistic timeline
     - Set milestones for progress tracking
     - Provide scheduling suggestions

3. **Track Progress**:
   - Mark individual chunks as completed
   - View progress percentages
   - Monitor time variance (actual vs estimated)

4. **Analytics**:
   - View task completion rates
   - Analyze time management patterns
   - Get insights on productivity

### API Endpoints

- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `POST /api/tasks/:id/plan` - AI-powered task planning
- `PATCH /api/tasks/:id/chunks/:chunkId` - Update chunk status
- `GET /api/tasks/:id/analytics` - Get task analytics
- `POST /api/tasks/:id/optimize` - AI-powered optimization suggestions

## 📚 Study Notebooks

### Features

- **Multiple Notebooks**: Create separate notebooks for different subjects/courses
- **Content Upload**: Upload PDFs, images, text files, and links
- **AI-Powered Analysis**: Get summaries, keywords, and insights from uploaded content
- **Conversational AI**: Chat with your study materials (NotebookLM-style)
- **Persistent Storage**: All content and conversations saved in MongoDB
- **Study Preferences**: Customize learning style and session settings

### How to Use

1. **Create a Notebook**:
   - Click "Create New Notebook"
   - Set title, description, subject, and course
   - Choose a color theme

2. **Add Content**:
   - Click "Add Content" in your notebook
   - Upload files (PDF, images, text) or add text content
   - Set importance level and tags
   - Click "🤖 AI Analyze" to get AI insights

3. **Chat with Content**:
   - Create a new conversation
   - Ask questions about your uploaded materials
   - AI will reference your content and provide explanations
   - Get study suggestions and related topics

4. **View Insights**:
   - Check analytics on study patterns
   - Review AI-generated insights
   - Track content organization

### API Endpoints

- `GET /api/notebooks` - Get all user notebooks
- `POST /api/notebooks` - Create new notebook
- `GET /api/notebooks/:id` - Get specific notebook
- `POST /api/notebooks/:id/content` - Upload content
- `POST /api/notebooks/:id/content/:contentId/analyze` - AI content analysis
- `POST /api/notebooks/:id/conversations` - Create conversation
- `POST /api/notebooks/:id/conversations/:conversationId/messages` - Send message
- `GET /api/notebooks/:id/insights` - Get notebook insights

## Database Models

### Task Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  priority: String, // low, medium, high, urgent
  status: String, // pending, in-progress, completed, paused
  totalEstimatedDuration: Number, // minutes
  actualDuration: Number,
  dueDate: Date,
  chunks: [{
    title: String,
    description: String,
    estimatedDuration: Number,
    priority: String,
    status: String,
    dueDate: Date,
    completedAt: Date,
    calendarEventId: String
  }],
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      date: Date,
      description: String,
      completed: Boolean
    }]
  },
  calendarIntegration: {
    googleCalendarId: String,
    notionPageId: String,
    synced: Boolean
  },
  aiSuggestions: [{
    type: String,
    content: String,
    timestamp: Date
  }]
}
```

### Notebook Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  subject: String,
  course: String,
  color: String,
  isActive: Boolean,
  lastAccessed: Date,
  content: [{
    title: String,
    type: String, // text, pdf, image, link, note
    content: String,
    filePath: String,
    fileSize: Number,
    tags: [String],
    importance: String, // low, medium, high, critical
    aiSummary: String,
    aiKeywords: [String]
  }],
  conversations: [{
    title: String,
    messages: [{
      role: String, // user, assistant
      content: String,
      timestamp: Date,
      attachments: [{
        type: String,
        name: String,
        size: Number
      }]
    }],
    lastMessageAt: Date,
    isActive: Boolean
  }],
  studyPreferences: {
    preferredStudyTime: String,
    studySessionDuration: Number,
    breakDuration: Number,
    difficultyLevel: String,
    learningStyle: String
  },
  insights: [{
    type: String,
    content: String,
    relatedContent: [String],
    timestamp: Date
  }],
  stats: {
    totalStudyTime: Number,
    contentItems: Number,
    conversations: Number,
    lastStudySession: Date
  }
}
```

## AI Integration

Both features use Google's Gemini AI for:

- **Task Planning**: Intelligent task breakdown and timeline creation
- **Content Analysis**: Summaries, keywords, and insights from uploaded materials
- **Conversational AI**: Context-aware responses based on user's content
- **Optimization**: Suggestions for time management and study strategies

## File Upload Support

Study Notebooks support uploading:
- **PDFs**: Text extraction and analysis
- **Images**: Visual content storage
- **Text files**: Direct content processing
- **Documents**: Word docs and other text formats
- **Links**: Web content references

## Calendar Integration (Future)

Planned features for Task Planner:
- Google Calendar sync
- Notion integration
- Automatic event creation
- Schedule optimization

## Security Features

- **Authentication**: All routes require valid JWT tokens
- **File Validation**: Secure file upload with type checking
- **Rate Limiting**: API protection against abuse
- **User Isolation**: Users can only access their own data

## Performance Optimizations

- **Database Indexing**: Efficient queries on user and date fields
- **File Size Limits**: 10MB max upload size
- **Pagination**: Large dataset handling
- **Caching**: Frequently accessed data caching

## Usage Examples

### Task Planning
```
1. Create task: "Complete React Project"
2. AI Planning: 
   - Chunk 1: Setup project structure (30 min)
   - Chunk 2: Create components (45 min)
   - Chunk 3: Implement state management (60 min)
   - Chunk 4: Testing and debugging (30 min)
3. Timeline: 4 days with daily milestones
4. Track progress by completing chunks
```

### Study Notebook
```
1. Create notebook: "Computer Science"
2. Upload: Lecture notes, textbook PDFs, practice problems
3. AI Analysis: Get summaries and key concepts
4. Chat: "Explain the difference between arrays and linked lists"
5. AI Response: References your uploaded materials and provides explanations
```

## Benefits

### For Students
- **Organized Learning**: Keep all study materials in one place
- **AI Assistance**: Get help understanding complex topics
- **Progress Tracking**: Monitor study habits and improvements
- **Time Management**: Better planning and scheduling

### For Professionals
- **Project Management**: Break down complex projects
- **Team Collaboration**: Share task timelines
- **Productivity Insights**: Understand work patterns
- **Goal Achievement**: Track progress toward objectives

## Future Enhancements

- **Real-time Collaboration**: Multi-user notebooks and task sharing
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile experience
- **Integration APIs**: Connect with external tools
- **Voice Interface**: Voice commands and dictation
- **Advanced AI**: More sophisticated analysis and recommendations

## Technical Requirements

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Tailwind CSS
- **AI**: Google Gemini API
- **File Storage**: Local file system (can be upgraded to cloud storage)
- **Authentication**: JWT tokens
- **Real-time**: Socket.io for live updates

This advanced feature set transforms LockIn from a simple study timer into a comprehensive productivity and learning platform, powered by cutting-edge AI technology. 