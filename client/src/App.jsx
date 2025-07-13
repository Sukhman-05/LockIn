import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './components/Profile';
import CustomizeCharacter from './components/CustomizeCharacter';
import { useAuth } from './AuthContext';
import { useMusic } from './MusicContext';
import { useBackground } from './BackgroundContext';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Timer from './Timer';

const tabs = [
  { name: 'Dashboard', path: '/' },
  { name: 'Profile', path: '/profile' },
  { name: 'Customize', path: '/customize' },
  { name: 'Study Pods', path: '/studypods' },
];

function PixelNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { muted, toggleMute } = useMusic();
  
  if (!user) return null;

  const handleLogout = () => {
    logout(() => navigate('/signin'));
  };

  return (
    <nav className="w-full flex justify-between items-center py-4 px-6 bg-pixelGray border-b-4 border-pixelYellow shadow-pixel">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-6 py-2 rounded border-2 border-pixelYellow text-pixelYellow font-pixel text-lg tracking-widest transition-all duration-150 hover:bg-pixelYellow hover:text-pixelGray btn-pixel ${location.pathname === tab.path ? 'bg-pixelYellow text-pixelGray' : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
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
          className="px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel text-sm shadow-pixel hover:bg-pixelOrange transition-all btn-pixel"
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

  return (
    <div className="min-h-screen flex flex-col font-pixel global-background">
      {/* Global animated stars background */}
      <div className="fixed inset-0 global-stars pointer-events-none z-0" />
      
      <div className="relative z-10">
        <PixelNavbar />
        <main className="flex-1 flex flex-col items-center justify-start py-8 px-2">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/customize" element={<RequireAuth><CustomizeCharacter /></RequireAuth>} />
            <Route path="/studypods" element={<RequireAuth><Timer /></RequireAuth>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
