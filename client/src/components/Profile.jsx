import React from 'react';
import PixelAvatar from './PixelAvatar';

function getAvatar() {
  try {
    return JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  } catch {
    return {};
  }
}

export default function Profile() {
  // Replace with real user data as needed
  const user = {
    username: 'Player1',
    email: 'player1@email.com',
    level: 2,
    xp: 60,
    bestStreak: 7,
  };
  const avatar = getAvatar();
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg p-8 flex flex-col items-center shadow-pixel w-full">
        <PixelAvatar {...avatar} size={96} />
        <h2 className="text-xl text-pixelYellow mt-4 mb-2">@{user.username}</h2>
        <div className="text-pixelYellow text-xs mb-4">{user.email}</div>
        <div className="flex gap-8 text-pixelYellow text-sm mb-4">
          <div>Level <span className="text-white">{user.level}</span></div>
          <div>XP <span className="text-white">{user.xp}</span></div>
          <div>Best Streak <span className="text-white">{user.bestStreak}</span></div>
        </div>
        <button className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all">
          Edit Profile
        </button>
      </div>
    </div>
  );
} 