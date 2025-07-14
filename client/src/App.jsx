import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard, { XPHelpModal } from './Dashboard';
import Profile from './components/Profile';
import CustomizeCharacter from './components/CustomizeCharacter';
import { useAuth } from './AuthContext';
import { useMusic } from './MusicContext';
import { useBackground } from './BackgroundContext';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Timer from './Timer';
import Chatbot from './components/Chatbot';
import TaskPlanner from './components/TaskPlanner';
import StudyNotebook from './components/StudyNotebook';

const tabs = [
  { name: 'Dashboard', path: '/' },
  { name: 'Profile', path: '/profile' },
  { name: 'Customize', path: '/customize' },
  { name: 'Study Pods', path: '/studypods' },
  { name: 'Task Planner', path: '/tasks' },
  { name: 'Study Notebooks', path: '/notebooks' },
  { name: 'AI Buddy', path: '/chatbot' },
];

function PixelNavbar({ onXPHelp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { muted, toggleMute } = useMusic();
  
  if (!user) return null;

  const handleLogout = () => {
    logout(() => navigate('/signin'));
  };

  return (
    <nav className="w-full flex flex-col md:flex-row justify-between items-center py-2 md:py-4 px-2 md:px-6 bg-pixelGray border-b-4 border-pixelYellow shadow-pixel gap-2 md:gap-0">
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
        {/* XP Help Button */}
        <button onClick={onXPHelp} className="w-10 h-10 flex items-center justify-center bg-pixelYellow border-2 border-pixelOrange rounded-full shadow-pixel text-pixelGray text-2xl font-bold" title="How to gain XP?">?</button>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-8 justify-center md:justify-start">
          {tabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 md:px-6 py-2 rounded border-2 border-pixelYellow text-pixelYellow font-pixel text-base md:text-lg tracking-widest transition-all duration-150 hover:bg-pixelYellow hover:text-pixelGray btn-pixel ${location.pathname === tab.path ? 'bg-pixelYellow text-pixelGray' : ''}`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-end">
        {/* Global Music Control */}
        <button 
          onClick={toggleMute} 
          className="w-10 h-10 flex items-center justify-center bg-pixelGray border-2 border-pixelYellow rounded-full shadow-pixel text-pixelYellow text-xl font-bold btn-pixel" 
          title={muted ? 'Unmute music' : 'Mute music'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel text-sm md:text-base shadow-pixel hover:bg-pixelOrange transition-all btn-pixel"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  const { currentTheme } = useBackground();
  const [showXPHelp, setShowXPHelp] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-pixel global-background bg-transparent">
      {/* Global animated stars background */}
      <div className="fixed inset-0 global-stars pointer-events-none z-0" />
      <div className="relative z-10 w-full">
        <PixelNavbar onXPHelp={() => setShowXPHelp(true)} />
        <main className="flex-1 flex flex-col items-center justify-start py-4 px-2 md:px-4 w-full max-w-5xl mx-auto">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/customize" element={<RequireAuth><CustomizeCharacter /></RequireAuth>} />
            <Route path="/studypods" element={<RequireAuth><Timer /></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><TaskPlanner /></RequireAuth>} />
            <Route path="/notebooks" element={<RequireAuth><StudyNotebook /></RequireAuth>} />
            <Route path="/chatbot" element={<RequireAuth><div className="w-full h-full"><Chatbot isOpen={false} onClose={() => {}} /></div></RequireAuth>} />
          </Routes>
        </main>
        {/* XP Help Modal (global) */}
        <XPHelpModal open={showXPHelp} onClose={() => setShowXPHelp(false)} />
      </div>
    </div>
  );
}
