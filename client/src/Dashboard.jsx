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
  const [showWelcome, setShowWelcome] = useState(() => {
    return sessionStorage.getItem('welcomeShown') !== 'true';
  });
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

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem('welcomeShown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Idle animation: bobbing avatar
  const [bob, setBob] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setBob(b => !b), 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic background (CSS keyframes)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bgStars { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
      .animate-bgStars { background-image: url('data:image/svg+xml;utf8,<svg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'10\' cy=\'10\' r=\'1.5\' fill=\'white\'/><circle cx=\'80\' cy=\'30\' r=\'1\' fill=\'white\'/><circle cx=\'50\' cy=\'70\' r=\'1.2\' fill=\'white\'/><circle cx=\'90\' cy=\'90\' r=\'0.8\' fill=\'white\'/></svg>'); background-repeat: repeat; animation: bgStars 20s linear infinite; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // HP bar animation
  const hpPercent = Math.max(0, Math.min(100, profile.hp));

  // Portrait logic
  const portrait = profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png';

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 relative">
      {showWelcome && profile.username && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 px-6 py-3 bg-pixelYellow text-pixelGray border-2 border-pixelOrange rounded-lg font-pixel text-lg shadow-pixel z-20 animate-fade-in-out">
          Welcome Back {profile.username}!
        </div>
      )}
      <AnimatedStars />
      {/* XP Help */}
      <button onClick={() => setShowXPHelp(true)} className="absolute top-2 left-2 w-10 h-10 flex items-center justify-center bg-pixelYellow border-2 border-pixelOrange rounded-full shadow-pixel text-pixelGray text-2xl font-bold z-10" title="How to gain XP?">?</button>
      <XPHelpModal open={showXPHelp} onClose={() => setShowXPHelp(false)} />
      {/* User Portrait */}
      <div className="flex items-center justify-center my-4">
        <img src={portrait} alt="User Portrait" className="w-40 h-56 object-contain rounded-lg border-4 border-pixelYellow shadow-pixel bg-pixelGray" />
      </div>
      {/* HP and XP Bars */}
      <div className="flex flex-col items-center gap-2 w-full">
        <PixelBar type="hp" value={profile.hp} max={100} />
        <PixelBar type="xp" value={profile.xp} max={profile.xpMax} />
      </div>
      {/* Stats */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex gap-4 justify-center">
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">Level {profile.level}</div>
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">HP {profile.hp}/100</div>
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">XP {profile.xp}/{profile.xpMax}</div>
        </div>
        {profile.streak && (
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">
            🔥 {profile.streak} Day Streak!
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button 
          onClick={() => navigate('/studypods')} 
          className="w-full max-w-sm py-4 bg-pixelGreen text-pixelGray border-4 border-pixelYellow rounded-lg font-pixel text-xl shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel"
        >
          Start Study Session
        </button>
        <div className="flex gap-4 w-full max-w-sm">
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