import React from 'react';

export default function PixelStreakCalendar({ totalSessions = 0, sessionMilestone = false }) {
  // 30 session boxes
  const boxes = 30;
  return (
    <div className="flex flex-col items-center">
      <div className="text-pixelYellow text-sm mb-2">Session Calendar</div>
      <div className="grid grid-cols-6 gap-1 bg-pixelGray p-2 border-4 border-pixelYellow rounded-lg shadow-pixel">
        {[...Array(boxes)].map((_, i) => {
          const filled = i < totalSessions;
          return (
            <div
              key={i}
              className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all duration-300
                ${filled ? (sessionMilestone && i === totalSessions - 1 ? 'bg-pixelGreen border-pixelYellow animate-bounce' : 'bg-pixelGreen border-pixelYellow') : 'bg-pixelGray border-pixelGray'}`}
              title={filled ? `Session ${i + 1} completed` : `Session ${i + 1}`}
            >
              {filled ? <span className="text-xs text-white">★</span> : ''}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-pixelYellow mt-2">Each square = 1 session. Green = completed session.</div>
      {sessionMilestone && (
        <div className="mt-2 text-pixelGreen font-pixel text-base bg-pixelGray border-2 border-pixelGreen rounded px-4 py-2 animate-pulse">
          🎉 30 Sessions Complete! +50 XP
        </div>
      )}
    </div>
  );
} 