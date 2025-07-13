import React, { useEffect, useState } from 'react';
import PixelAvatar from './components/PixelAvatar';
import PixelStreakCalendar from './components/PixelStreakCalendar';
import { useAuth } from './AuthContext';
import axios from 'axios';

function getAvatar() {
  try {
    return JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  } catch {
    return {};
  }
}

function DynamicBackground() {
  // Animate stars with CSS keyframes
  return <div className="fixed inset-0 -z-10 animate-bgStars" style={{ pointerEvents: 'none' }} />;
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
  const avatar = getAvatar();

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

  // Dynamic background (CSS keyframes)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bgStars { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
      .animate-bgStars { background-image: url('data:image/svg+xml;utf8,<svg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'10\' cy=\'10\' r=\'1.5\' fill=\'white\'/><circle cx=\'80\' cy=\'30\' r=\'1\' fill=\'white\'/><circle cx=\'50\' cy=\'70\' r=\'1.2\' fill=\'white\'/><circle cx=\'90\' cy=\'90\' r=\'0.8\' fill=\'white\'/></svg>'); background-repeat: repeat; animation: bgStars 20s linear infinite; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Soundtrack
  useEffect(() => {
    let audio = document.getElementById('bg-music');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'bg-music';
      audio.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3'; // Free chiptune loop
      audio.loop = true;
      audio.volume = 0.2;
      document.body.appendChild(audio);
    }
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, []);

  // HP bar animation
  const hpPercent = Math.max(0, Math.min(100, profile.hp));

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 relative">
      <DynamicBackground />
      {/* Logout button */}
      <button onClick={logout} className="absolute top-2 right-2 px-4 py-2 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel text-sm shadow-pixel hover:bg-pixelOrange transition-all z-10">Logout</button>
      {/* XP Help */}
      <button onClick={() => setShowXPHelp(true)} className="absolute top-2 left-2 w-10 h-10 flex items-center justify-center bg-pixelYellow border-2 border-pixelOrange rounded-full shadow-pixel text-pixelGray text-2xl font-bold z-10" title="How to gain XP?">?</button>
      <XPHelpModal open={showXPHelp} onClose={() => setShowXPHelp(false)} />
      {/* Character (bobbing idle animation) */}
      <div className={`transition-transform duration-700 ${bob ? 'translate-y-2' : '-translate-y-2'}`}>
        <PixelAvatar {...avatar} size={128} />
      </div>
      {/* HP and XP Bars */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-4 mb-1">
          <span className="text-pixelYellow text-lg">LEVEL</span>
          <span className="text-pixelPurple text-2xl">{profile.level}</span>
        </div>
        <div className="w-64 h-6 bg-pixelGray border-2 border-pixelYellow rounded flex items-center relative mb-2">
          <div className="h-full bg-pixelGreen rounded transition-all duration-500" style={{ width: `${(profile.xp / (profile.xpMax || 100)) * 100}%` }} />
          <span className="absolute left-1/2 -translate-x-1/2 text-pixelYellow text-xs font-pixel">
            XP: {profile.xp} / {profile.xpMax || 100}
          </span>
        </div>
        <div className="w-64 h-6 bg-pixelGray border-2 border-pixelRed rounded flex items-center relative">
          <div className="h-full bg-pixelRed rounded transition-all duration-500" style={{ width: `${hpPercent}%` }} />
          <span className="absolute left-1/2 -translate-x-1/2 text-white text-xs font-pixel">
            HP: {profile.hp} / 100
          </span>
        </div>
      </div>
      {/* Study Pods Button */}
      <button className="px-10 py-4 bg-pixelYellow text-pixelGray border-4 border-pixelOrange rounded-lg font-pixel text-xl shadow-pixel hover:bg-pixelOrange hover:text-white transition-all">
        Study Pods
      </button>
      {/* Streak Calendar */}
      <PixelStreakCalendar streakHistory={streakHistory} />
    </div>
  );
} 