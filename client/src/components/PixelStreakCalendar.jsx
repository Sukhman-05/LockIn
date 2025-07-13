import React from 'react';

function getRecentDays(n = 42) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

export default function PixelStreakCalendar({ streakHistory = [] }) {
  // streakHistory: array of ISO date strings
  const streakSet = new Set(streakHistory.map(d => new Date(d).toDateString()));
  const days = getRecentDays(42);
  return (
    <div className="flex flex-col items-center">
      <div className="text-pixelYellow text-sm mb-2">Streak Calendar</div>
      <div className="grid grid-cols-7 gap-1 bg-pixelGray p-2 border-4 border-pixelYellow rounded-lg shadow-pixel">
        {days.map((date, i) => {
          const focused = streakSet.has(date.toDateString());
          return (
            <div
              key={i}
              className={`w-6 h-6 rounded-sm border-2 ${focused ? 'bg-pixelGreen border-pixelYellow animate-pulse-slow' : 'bg-pixelGray border-pixelGray'} flex items-center justify-center`}
              title={focused ? `Focus day: ${date.toLocaleDateString()}` : `Missed day: ${date.toLocaleDateString()}`}
            >
              {focused ? <span className="text-xs text-white">★</span> : ''}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-pixelYellow mt-2">Each square = 1 day. Green = focus day.</div>
    </div>
  );
} 