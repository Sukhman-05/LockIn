import React from 'react';
import PixelAvatar from './components/PixelAvatar';
import PixelStreakCalendar from './components/PixelStreakCalendar';

function getAvatar() {
  try {
    return JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  } catch {
    return {};
  }
}

export default function Dashboard() {
  // Replace with real user data as needed
  const user = {
    username: 'Player1',
    level: 1,
    xp: 40,
    xpMax: 100,
    streakDays: [true, true, false, true, true, true, false, true, false, false, true, true, true, true, false, false, false, true, true, false, true, true, true, false, false, false, true, true, false, true, true, false, false, false, false, true, true, false, false, false, false, false],
  };
  const avatar = getAvatar();
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8">
      {/* Character on pedestal */}
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
            <PixelAvatar {...avatar} size={128} />
          </div>
          <div className="mt-24 w-32 h-8 bg-pixelYellow border-4 border-pixelGray rounded-b-2xl flex items-end justify-center shadow-pixel" style={{ marginTop: '96px' }}>
            <span className="text-pixelGray font-pixel text-xs">@{user.username}</span>
          </div>
        </div>
        {/* XP Bar and Level */}
        <div className="flex flex-col items-center mt-6 w-full">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-pixelYellow text-lg">LEVEL</span>
            <span className="text-pixelPurple text-2xl">{user.level}</span>
          </div>
          <div className="w-64 h-6 bg-pixelGray border-2 border-pixelYellow rounded flex items-center relative">
            <div
              className="h-full bg-pixelGreen rounded"
              style={{ width: `${(user.xp / user.xpMax) * 100}%` }}
            />
            <span className="absolute left-1/2 -translate-x-1/2 text-pixelYellow text-xs font-pixel">
              XP: {user.xp} / {user.xpMax}
            </span>
          </div>
        </div>
      </div>
      {/* Start Quest Button */}
      <button className="px-10 py-4 bg-pixelYellow text-pixelGray border-4 border-pixelOrange rounded-lg font-pixel text-xl shadow-pixel hover:bg-pixelOrange hover:text-white transition-all">
        ▶ Start Your Quest
      </button>
      {/* Streak Calendar */}
      <PixelStreakCalendar streakDays={user.streakDays} />
    </div>
  );
} 