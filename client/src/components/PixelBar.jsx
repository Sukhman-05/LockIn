import React from 'react';

// Pixelated colors for XP and HP
const BAR_COLORS = {
  xp: {
    fill: 'bg-blue-400',
    bg: 'bg-black',
    border: 'border-white',
    text: 'text-white',
    label: 'XP'
  },
  hp: {
    fill: 'bg-red-600',
    bg: 'bg-black',
    border: 'border-white',
    text: 'text-white',
    label: 'HP'
  }
};

export default function PixelBar({ type = 'xp', value = 0, max = 100, hideLabelOnDesktop = false }) {
  // Ensure we have valid values with fallbacks
  const safeValue = Math.max(0, value || 0);
  const safeMax = Math.max(1, max || 100); // Prevent division by zero
  const percentage = Math.min(100, (safeValue / safeMax) * 100);
  const { fill, bg, border, text, label } = BAR_COLORS[type] || BAR_COLORS.xp;
  
  return (
    <div className="w-full flex flex-col items-center mb-4">
      {/* Label */}
      <div className={`mb-1 text-xs font-pixel ${text}`}>
        {label}
      </div>
      
      {/* Pixelated progress bar */}
      <div className="w-full max-w-xs">
        <div className={`w-full h-6 ${bg} border-2 ${border} flex pixel`}>
          <div 
            className={`h-full ${fill} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
} 