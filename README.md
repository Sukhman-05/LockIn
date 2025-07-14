# 🔐 LockIn - Focus & Productivity Web App

A modern web application designed to help students and professionals "lock in" and maintain focus during study sessions using time-based productivity tools, gamification, analytics, and real-time collaboration.

## ✨ Features

### 🕓 Core Timer Features
- **Pomodoro Timer**: 25-minute focus sessions with 5-minute breaks
- **Customizable Durations**: Adjust focus and break times to your preference
- **Session Tracking**: Automatic logging of all focus sessions
- **Notifications**: Browser notifications for session start/end

### 🎮 Gamification System
- **XP System**: Earn experience points for completed focus sessions
- **Leveling**: Progress through levels based on XP earned
- **Streaks**: Track daily focus streaks
- **Leaderboards**: Compete with other users
- **Badges**: Unlock achievements for milestones

### 🤖 AI Study Buddy
- **Intelligent Chatbot**: Personalized study companion
- **Motivation System**: Context-aware encouragement based on your progress
- **Task Organization**: Help break down projects and organize to-do lists
- **Study Techniques**: Personalized tips based on your study patterns
- **Reminder System**: Smart notifications to keep you on track
- **Subject-Specific Help**: Specialized guidance for different subjects

### 👥 Study Pods (Real-time Collaboration)
- **Create/Join Pods**: Generate or join study groups with unique codes
- **Synchronized Timers**: Real-time shared Pomodoro sessions
- **Group Motivation**: Focus together with peers

### 📊 Analytics Dashboard
- **Progress Tracking**: View total focus time and session history
- **Daily Statistics**: Track daily, weekly, and monthly progress
- **Visual Charts**: See your productivity trends
- **Personal Insights**: Best days, averages, and streaks

### 🔐 Security & Performance
- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management
- **Security Headers**: Protection against common attacks

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lockin.git
   cd lockin
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Create environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   PORT=5000
   ```

4. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Start development servers**
   
   Backend (from `server` directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from `client` directory):
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
cd server
npm test
```

### Run All Tests
```bash
# From root directory
npm run test:all
```

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 19**: Latest React with hooks and context
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API calls
- **Socket.io Client**: Real-time communication

### Backend (Node.js + Express)
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Authentication
- **Socket.io**: Real-time features
- **Bcrypt**: Password hashing

### Security Features
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Data sanitization
- **Security Headers**: Protection against attacks
- **Error Handling**: Comprehensive error management

## 📦 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set build directory to `client`
4. Add environment variables

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory to `server`
4. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lockin
JWT_SECRET=your_secure_secret_key
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/stats` - Get session statistics

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

### Study Pods
- `POST /api/pods` - Create study pod
- `POST /api/pods/join` - Join study pod

### Chatbot
- `GET /api/chatbot/stats` - Get personalized study statistics
- `GET /api/chatbot/motivation` - Get contextual motivational messages
- `GET /api/chatbot/reminders` - Get study session reminders
- `GET /api/chatbot/tips` - Get personalized study tips
- `POST /api/chatbot/tasks` - Save user task lists

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic timer functionality
- ✅ User authentication
- ✅ Session tracking
- ✅ Study pods
- ✅ Leaderboards
- ✅ AI Study Buddy chatbot

### Phase 2 (Next)
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Offline support
- [ ] Enhanced AI features
- [ ] Integration with calendar apps
- [ ] Team challenges

### Phase 3 (Future)
- [ ] AI-powered insights
- [ ] Integration with productivity tools
- [ ] Advanced gamification
- [ ] Social features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) for the time management methodology
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI components
- [Socket.io](https://socket.io/) for real-time features

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for productive people everywhere**
