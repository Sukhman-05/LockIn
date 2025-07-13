import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelAvatar from './components/PixelAvatar';
import PixelStreakCalendar from './components/PixelStreakCalendar';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Timer from './Timer';
import PixelBar from './components/PixelBar';
import AnimatedStars from './components/AnimatedStars';

function getAvatar() {
  try {
    return JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  } catch {
    return {};
  }
}

function XPHelpModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
      <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg p-8 shadow-pixel max-w-md w-full flex flex-col items-center">
        <h2 className="text-xl text-pixelYellow mb-4">How to Gain XP</h2>
        <ul className="text-white text-sm list-disc list-inside mb-4">
          <li>Complete a study session: +1 XP per minute focused</li>
          <li>Keep your streak going for bonus XP</li>
          <li>Don't quit mid-session or you'll lose HP!</li>
        </ul>
        <button className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ username: '', level: 1, xp: 0, xpMax: 100, hp: 100 });
  const [streakHistory, setStreakHistory] = useState([]);
  const [showXPHelp, setShowXPHelp] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const avatar = getAvatar();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${user?.token}` } });
        setProfile(p => ({ ...p, ...res.data }));
      } catch {}
    }
    async function fetchStreak() {
      try {
        const res = await axios.get('/api/sessions/streak', { headers: { Authorization: `Bearer ${user?.token}` } });
        setProfile(p => ({ ...p, streak: res.data.streak }));
        setStreakHistory(res.data.streakHistory || []);
      } catch {}
    }
    if (user?.token) {
      fetchProfile();
      fetchStreak();
    }
  }, [user]);

  // Idle animation: bobbing avatar
  const [bob, setBob] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setBob(b => !b), 1000);
    return () => clearInterval(interval);
  }, []);

  // HP bar animation
  const hpPercent = Math.max(0, Math.min(100, profile.hp));

  // Portrait logic
  const portrait = profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto gap-8 relative">
      <AnimatedStars />
      {/* XP Help */}
      <button onClick={() => setShowXPHelp(true)} className="absolute top-2 left-2 w-10 h-10 flex items-center justify-center bg-pixelYellow border-2 border-pixelOrange rounded-full shadow-pixel text-pixelGray text-2xl font-bold z-10" title="How to gain XP?">?</button>
      <XPHelpModal open={showXPHelp} onClose={() => setShowXPHelp(false)} />
      
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-pixel text-pixelYellow mb-2" style={{ textShadow: '0 0 8px #ffe066, 0 0 2px #fff' }}>
          Let's Lock IN
        </h1>
      </div>
      
      {/* Portrait and Stats Section */}
      <div className="flex items-start gap-8 w-full max-w-2xl">
        {/* User Portrait */}
        <div className="flex-shrink-0">
          <img src={portrait} alt="User Portrait" className="w-40 h-56 object-contain rounded-lg border-4 border-pixelYellow shadow-pixel bg-pixelGray" />
        </div>
        
        {/* HP and XP Bars */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-center mb-2">
            <h2 className="text-xl text-pixelYellow font-pixel">@{profile.username}</h2>
          </div>
          <PixelBar type="hp" value={profile.hp} max={100} />
          <PixelBar type="xp" value={profile.xp} max={profile.xpMax} />
          
          {/* Stats */}
          <div className="flex gap-4 justify-center mt-4">
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">Level {profile.level}</div>
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">HP {profile.hp}/100</div>
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">XP {profile.xp}/{profile.xpMax}</div>
          </div>
          {profile.streak && (
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs text-center">
              🔥 {profile.streak} Day Streak!
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <button 
          onClick={() => navigate('/studypods')} 
          className="w-full py-4 bg-pixelGreen text-pixelGray border-4 border-pixelYellow rounded-lg font-pixel text-xl shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel"
        >
          Start Study Session
        </button>
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => navigate('/profile')} 
            className="flex-1 py-3 bg-pixelBlue text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel"
          >
            Profile
          </button>
          <button 
            onClick={() => navigate('/customize')} 
            className="flex-1 py-3 bg-pixelPurple text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel"
          >
            Customize
          </button>
        </div>
      </div>
      
      {/* Streak Calendar */}
      <PixelStreakCalendar streakHistory={streakHistory} />
    </div>
  );
} 