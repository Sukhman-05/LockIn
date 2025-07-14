import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelAvatar from './components/PixelAvatar';
import PixelStreakCalendar from './components/PixelStreakCalendar';
import { useAuth } from './AuthContext';
import api from './utils/api';
import Timer from './Timer';
import PixelBar from './components/PixelBar';

function getAvatar() {
  try {
    return JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  } catch {
    return {};
  }
}

export function XPHelpModal({ open, onClose }) {
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
        const res = await api.get('/auth/me');
        setProfile(p => ({ ...p, ...res.data }));
      } catch {}
    }
    async function fetchStreak() {
      try {
        const res = await api.get('/sessions/streak');
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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto gap-8 relative px-2 md:px-0">
      {/* XP Help */}
      <XPHelpModal open={showXPHelp} onClose={() => setShowXPHelp(false)} />
      {/* Main Title */}
      <div className="text-center mb-4 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-pixel text-pixelYellow mb-2" style={{ textShadow: '0 0 8px #ffe066, 0 0 2px #fff' }}>
          Let's Lock IN
        </h1>
      </div>
      {/* Top Row: Avatar, Stats, Calendar */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
        {/* User Portrait */}
        <div className="flex flex-col items-center bg-pixelGray/80 border-4 border-pixelYellow rounded-lg shadow-pixel p-4 min-w-0 w-full md:max-w-xs flex-1 h-full">
          <div className="w-full h-full flex items-center justify-center">
            <img src={portrait} alt="User Portrait" className="w-full h-full max-h-72 md:max-h-96 object-contain rounded-lg border-4 border-pixelYellow shadow-pixel bg-pixelGray" />
          </div>
        </div>
        {/* Stats */}
        <div className="flex flex-col items-center justify-center bg-pixelGray/80 border-4 border-pixelYellow rounded-lg shadow-pixel p-4 flex-1 min-w-0 w-full">
          <div className="text-center mb-2">
            <h2 className="text-lg md:text-xl text-pixelYellow font-pixel">@{profile.username}</h2>
          </div>
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <PixelBar type="hp" value={profile.hp} max={100} />
            <PixelBar type="xp" value={profile.xp} max={profile.xpMax} />
          </div>
          <div className="flex flex-col gap-2 w-full items-center mt-2">
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-2 md:px-3 py-1 font-pixel text-pixelYellow text-xs w-full text-center">Level {profile.level}</div>
          </div>
          {profile.streak && (
            <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs text-center mt-2">
              🔥 {profile.streak} Day Streak!
            </div>
          )}
        </div>
        {/* Streak Calendar */}
        <div className="flex flex-col items-center justify-center bg-pixelGray/80 border-4 border-pixelYellow rounded-lg shadow-pixel p-4 flex-1 min-w-0 w-full overflow-x-auto">
          <div className="w-full max-w-xs md:max-w-none">
            <PixelStreakCalendar streakHistory={streakHistory} />
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-col items-center gap-4 w-full max-w-2xl mx-auto mt-2 md:mt-4 md:items-stretch">
        <button 
          onClick={() => navigate('/studypods')} 
          className="w-full py-4 px-4 bg-pixelGreen text-pixelGray border-4 border-pixelYellow rounded-lg font-pixel text-lg md:text-xl shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel order-1"
        >
          Start Study Session
        </button>
        <button 
          onClick={() => navigate('/customize')} 
          className="w-full py-3 bg-pixelPurple text-white border-2 border-pixelYellow rounded font-pixel text-base md:text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel order-2"
        >
          Customize
        </button>
        <button 
          onClick={() => navigate('/profile')} 
          className="w-full py-3 bg-pixelBlue text-white border-2 border-pixelYellow rounded font-pixel text-base md:text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel order-3"
        >
          Profile
        </button>
      </div>
      {/* Streak Calendar Label */}
      <div className="text-xs text-pixelYellow mt-2 md:mt-4 text-center">Each square = 1 session. Green = completed session.</div>
    </div>
  );
} 