import React from 'react';

// Simple pixel avatar using SVG rectangles for a retro look
export default function PixelAvatar({ skin = '#f9d6b8', hair = '#23272e', shirt = '#3b82f6', pants = '#23272e', size = 96 }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 32 48" className="drop-shadow-glow" style={{ imageRendering: 'pixelated' }}>
      {/* Head */}
      <rect x="10" y="2" width="12" height="10" fill={skin} stroke="#000" strokeWidth="1" />
      {/* Hair */}
      <rect x="10" y="0" width="12" height="4" fill={hair} stroke="#000" strokeWidth="1" />
      <rect x="8" y="2" width="4" height="4" fill={hair} stroke="#000" strokeWidth="1" />
      <rect x="20" y="2" width="4" height="4" fill={hair} stroke="#000" strokeWidth="1" />
      {/* Body */}
      <rect x="12" y="12" width="8" height="10" fill={shirt} stroke="#000" strokeWidth="1" />
      {/* Arms */}
      <rect x="8" y="14" width="4" height="6" fill={skin} stroke="#000" strokeWidth="1" />
      <rect x="20" y="14" width="4" height="6" fill={skin} stroke="#000" strokeWidth="1" />
      {/* Legs */}
      <rect x="12" y="22" width="4" height="10" fill={pants} stroke="#000" strokeWidth="1" />
      <rect x="16" y="22" width="4" height="10" fill={pants} stroke="#000" strokeWidth="1" />
      {/* Shoes */}
      <rect x="12" y="32" width="4" height="2" fill="#23272e" stroke="#000" strokeWidth="1" />
      <rect x="16" y="32" width="4" height="2" fill="#23272e" stroke="#000" strokeWidth="1" />
    </svg>
  );
} 