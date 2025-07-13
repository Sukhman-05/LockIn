import React from 'react';

export default function PixelStreakCalendar({ streakDays = [] }) {
  // streakDays: array of booleans, true = focused, false = missed
  // Fill to 42 days (6 weeks)
  const days = Array(42).fill(false).map((_, i) => streakDays[i] || false);
  return (
    <div className="flex flex-col items-center">
      <div className="text-pixelYellow text-sm mb-2">Streak Calendar</div>
      <div className="grid grid-cols-7 gap-1 bg-pixelGray p-2 border-4 border-pixelYellow rounded-lg shadow-pixel">
        {days.map((focused, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-sm border-2 ${focused ? 'bg-pixelGreen border-pixelYellow' : 'bg-pixelGray border-pixelGray'} flex items-center justify-center`}
            title={focused ? 'Focus day' : 'Missed day'}
          >
            {focused ? <span className="text-xs text-white">★</span> : ''}
          </div>
        ))}
      </div>
      <div className="text-xs text-pixelYellow mt-2">Each square = 1 day. Green = focus day.</div>
    </div>
  );
} 