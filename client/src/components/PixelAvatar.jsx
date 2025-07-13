import React from 'react';

// Preset data for three characters
export function getPresets() {
  return [
    {
      name: 'Valiant Knight',
      description: 'A noble warrior clad in shining armor, ready to defend the realm.',
      avatarProps: { preset: 'knight' }
    },
    {
      name: 'Arcane Sorceress',
      description: 'A master of the mystical arts, wielding powerful spells and ancient knowledge.',
      avatarProps: { preset: 'sorceress' }
    },
    {
      name: 'Nimble Rogue',
      description: 'A shadowy figure skilled in stealth, speed, and cunning.',
      avatarProps: { preset: 'rogue' }
    }
  ];
}

// Simple pixel avatar using SVG rectangles for a retro look
export default function PixelAvatar({ preset, skin = '#f9d6b8', hair = '#23272e', shirt = '#3b82f6', pants = '#23272e', size = 96 }) {
  if (preset === 'knight') {
    // Valiant Knight SVG
    return (
      <svg width={size} height={size * 1.5} viewBox="0 0 32 48" style={{ imageRendering: 'pixelated' }}>
        {/* Helmet */}
        <rect x="10" y="0" width="12" height="6" fill="#444851" stroke="#222" strokeWidth="1" />
        <rect x="10" y="6" width="12" height="6" fill="#6c7a89" stroke="#222" strokeWidth="1" />
        {/* Plume */}
        <rect x="16" y="-2" width="2" height="4" fill="#b71c1c" stroke="#7f1010" strokeWidth="1" />
        {/* Face slit */}
        <rect x="14" y="8" width="4" height="2" fill="#222" />
        {/* Breastplate */}
        <rect x="12" y="12" width="8" height="10" fill="#bfc9ca" stroke="#222" strokeWidth="1" />
        {/* Crest */}
        <rect x="16" y="15" width="2" height="2" fill="#ffd700" stroke="#bfa100" strokeWidth="0.5" />
        {/* Chainmail arms */}
        <rect x="8" y="14" width="4" height="6" fill="#888" stroke="#222" strokeWidth="1" />
        <rect x="20" y="14" width="4" height="6" fill="#888" stroke="#222" strokeWidth="1" />
        {/* Gauntlets */}
        <rect x="8" y="20" width="4" height="2" fill="#444851" stroke="#222" strokeWidth="1" />
        <rect x="20" y="20" width="4" height="2" fill="#444851" stroke="#222" strokeWidth="1" />
        {/* Cape */}
        <rect x="6" y="12" width="4" height="18" fill="#7b1fa2" stroke="#4a1067" strokeWidth="1" />
        {/* Legs */}
        <rect x="12" y="22" width="4" height="10" fill="#888" stroke="#222" strokeWidth="1" />
        <rect x="16" y="22" width="4" height="10" fill="#888" stroke="#222" strokeWidth="1" />
        {/* Greaves */}
        <rect x="12" y="32" width="4" height="2" fill="#444851" stroke="#222" strokeWidth="1" />
        <rect x="16" y="32" width="4" height="2" fill="#444851" stroke="#222" strokeWidth="1" />
        {/* Sword hilt */}
        <rect x="24" y="28" width="2" height="8" fill="#bfa100" stroke="#7f1010" strokeWidth="1" />
        <rect x="24" y="36" width="4" height="2" fill="#888" stroke="#222" strokeWidth="1" />
      </svg>
    );
  }
  if (preset === 'sorceress') {
    // Arcane Sorceress SVG
    return (
      <svg width={size} height={size * 1.5} viewBox="0 0 32 48" style={{ imageRendering: 'pixelated' }}>
        {/* Hair */}
        <rect x="10" y="0" width="12" height="6" fill="#a259f7" stroke="#4a1067" strokeWidth="1" />
        {/* Head */}
        <rect x="12" y="6" width="8" height="8" fill="#f9d6b8" stroke="#222" strokeWidth="1" />
        {/* Robe */}
        <rect x="12" y="14" width="8" height="14" fill="#3b3b98" stroke="#222" strokeWidth="1" />
        {/* Embroidery */}
        <rect x="12" y="26" width="8" height="2" fill="#ffd700" />
        {/* Sleeves */}
        <rect x="8" y="16" width="4" height="8" fill="#3b3b98" stroke="#222" strokeWidth="1" />
        <rect x="20" y="16" width="4" height="8" fill="#3b3b98" stroke="#222" strokeWidth="1" />
        {/* Magical aura */}
        <rect x="10" y="10" width="12" height="2" fill="#b3e6ff" opacity="0.5" />
        {/* Staff */}
        <rect x="4" y="20" width="2" height="18" fill="#8d5524" stroke="#222" strokeWidth="1" />
        <rect x="2" y="36" width="6" height="2" fill="#b3e6ff" stroke="#222" strokeWidth="1" />
        {/* Amulet */}
        <rect x="16" y="20" width="2" height="2" fill="#ffd700" stroke="#bfa100" strokeWidth="0.5" />
        {/* Skirt */}
        <rect x="12" y="28" width="8" height="8" fill="#3b3b98" stroke="#222" strokeWidth="1" />
        {/* Shoes */}
        <rect x="12" y="36" width="4" height="2" fill="#23272e" stroke="#222" strokeWidth="1" />
        <rect x="16" y="36" width="4" height="2" fill="#23272e" stroke="#222" strokeWidth="1" />
      </svg>
    );
  }
  if (preset === 'rogue') {
    // Nimble Rogue SVG
    return (
      <svg width={size} height={size * 1.5} viewBox="0 0 32 48" style={{ imageRendering: 'pixelated' }}>
        {/* Hood */}
        <rect x="10" y="0" width="12" height="8" fill="#23272e" stroke="#111" strokeWidth="1" />
        {/* Face */}
        <rect x="12" y="8" width="8" height="8" fill="#c68642" stroke="#222" strokeWidth="1" />
        {/* Cloak */}
        <rect x="8" y="16" width="16" height="14" fill="#23272e" stroke="#111" strokeWidth="1" />
        {/* Leather armor */}
        <rect x="12" y="16" width="8" height="10" fill="#8d5524" stroke="#222" strokeWidth="1" />
        {/* Belt */}
        <rect x="12" y="26" width="8" height="2" fill="#ffe066" />
        {/* Arms */}
        <rect x="8" y="18" width="4" height="8" fill="#8d5524" stroke="#222" strokeWidth="1" />
        <rect x="20" y="18" width="4" height="8" fill="#8d5524" stroke="#222" strokeWidth="1" />
        {/* Daggers */}
        <rect x="6" y="28" width="2" height="8" fill="#bfc9ca" stroke="#222" strokeWidth="1" />
        <rect x="24" y="28" width="2" height="8" fill="#bfc9ca" stroke="#222" strokeWidth="1" />
        {/* Legs */}
        <rect x="12" y="30" width="4" height="10" fill="#23272e" stroke="#111" strokeWidth="1" />
        <rect x="16" y="30" width="4" height="10" fill="#23272e" stroke="#111" strokeWidth="1" />
        {/* Shoes */}
        <rect x="12" y="40" width="4" height="2" fill="#444" stroke="#111" strokeWidth="1" />
        <rect x="16" y="40" width="4" height="2" fill="#444" stroke="#111" strokeWidth="1" />
      </svg>
    );
  }
  // Default: custom avatar
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