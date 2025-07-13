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

export default function PixelBar({ type = 'xp', value = 0, max = 100 }) {
  const { fill, border, text, label, glow } = BAR_COLORS[type] || BAR_COLORS.xp;
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  // Pixel steps: 10 blocks
  const blocks = 10;
  const filledBlocks = Math.round((percent / 100) * blocks);
  return (
    <div className={`w-64 h-8 flex items-center relative mb-2`}>
      <div className={`absolute inset-0 flex gap-0.5 px-1 py-1 ${border} border-4 rounded-none bg-pixelGray`} style={{ boxShadow: '0 0 0 2px #000, 0 0 8px #0008' }}>
        {[...Array(blocks)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full mx-0.5 ${i < filledBlocks ? fill : 'bg-pixelGray'} ${glow} rounded-none border-l-2 border-black last:border-r-2 last:border-black`}
            style={{ minWidth: 0 }}
          />
        ))}
      </div>
      <span className={`absolute left-1/2 -translate-x-1/2 ${text} text-xs font-pixel z-10`} style={{ textShadow: '0 0 2px #000, 0 0 8px #0008' }}>
        {label}: {value} / {max}
      </span>
    </div>
  );
} 