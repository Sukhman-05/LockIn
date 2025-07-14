import React from 'react';

// Pixel colors for XP and HP
const BAR_COLORS = {
  xp: {
    fill: 'bg-pixelGreen',
    border: 'border-pixelYellow',
    text: 'text-pixelYellow',
    label: 'XP',
    glow: 'shadow-[0_0_8px_#ffe066]'
  },
  hp: {
    fill: 'bg-pixelRed',
    border: 'border-pixelRed',
    text: 'text-white',
    label: 'HP',
    glow: 'shadow-[0_0_8px_#ff4d4d]'
  }
};

export default function PixelBar({ type = 'xp', value = 0, max = 100, hideLabelOnDesktop = false }) {
  const { fill, border, text, label, glow } = BAR_COLORS[type] || BAR_COLORS.xp;
  const percent = type === 'hp' ? 100 : Math.max(0, Math.min(100, (value / max) * 100));
  // Pixel steps: 10 blocks
  const blocks = 10;
  const filledBlocks = Math.round((percent / 100) * blocks);
  return (
    <div className="w-full flex flex-col items-center mb-4">
      {/* Numeric value above bar */}
      <div className={`mb-1 font-pixel text-sm ${text} text-center`} style={{ textShadow: '0 0 2px #000, 0 0 8px #0008' }}>
        {label}: <span className="font-bold">{value}</span>/<span>{max}</span>
      </div>
      <div className="w-full flex justify-center">
        <div className={`relative w-64 h-8 flex items-center ${border} border-4 rounded-full bg-pixelGray overflow-hidden`} style={{ boxShadow: '0 0 0 2px #000, 0 0 8px #0008' }}>
          {[...Array(blocks)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full mx-0.5 ${i < filledBlocks ? fill : 'bg-pixelGray'} ${i < filledBlocks ? glow : ''} rounded-full transition-all duration-300`}
              style={{ minWidth: 0 }}
            />
          ))}
          {/* Centered label inside bar (optional, can remove if not needed) */}
          {/* <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${text} text-xs font-pixel z-10`} style={{ textShadow: '0 0 2px #000, 0 0 8px #0008' }}>{label}</span> */}
        </div>
      </div>
    </div>
  );
} 