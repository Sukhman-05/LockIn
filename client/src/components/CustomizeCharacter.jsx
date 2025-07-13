import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../AuthContext';
import { useBackground } from '../BackgroundContext';

const PORTRAITS = [
  {
    name: 'Character 1',
    img: '/Character1.png',
    bio: 'A determined and friendly hero ready for adventure.'
  },
  {
    name: 'Character 2',
    img: '/Character2.png',
    bio: 'A wise and resourceful companion with a mysterious past.'
  },
  {
    name: 'Character 3',
    img: '/Character3.png',
    bio: 'A cheerful and energetic explorer who loves challenges.'
  }
];

const BACKGROUND_COLORS = [
  { name: 'Classic Brown', color: '#6b4423' },
  { name: 'Royal Purple', color: '#2d1b4e' },
  { name: 'Forest Green', color: '#2c7a4a' },
  { name: 'Sky Blue', color: '#3b82f6' },
  { name: 'Pixel Gray', color: '#22223b' }
];

export default function CustomizeCharacter() {
  const { user } = useAuth();
  const { setPortrait, setBackground } = useBackground();
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem('selectedPortrait') || PORTRAITS[0].img;
  });
  const [bgColor, setBgColor] = useState(() => {
    return localStorage.getItem('selectedBackground') || BACKGROUND_COLORS[0].color;
  });
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const current = PORTRAITS.find(p => p.img === selected) || PORTRAITS[0];

  const handleSelect = (img) => {
    setSelected(img);
    localStorage.setItem('selectedPortrait', img);
    setSuccess(false);
  };

  const handleBgColor = (color) => {
    setBgColor(color);
    localStorage.setItem('selectedBackground', color);
    setSuccess(false);
  };

  const handleConfirm = async () => {
    if (!user?.token) {
      return;
    }
    setSuccess(false);
    setIsLoading(true);
    try {
      await api.patch('/auth/me', { portrait: selected, background: bgColor });
      setSuccess(true);
      localStorage.setItem('selectedPortrait', selected);
      localStorage.setItem('selectedBackground', bgColor);
      setPortrait(selected);
      if (setBackground) setBackground(bgColor);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-pixelDark py-8 px-2">
      <div className="text-3xl md:text-4xl text-pixelYellow font-pixel mb-6 tracking-widest text-center drop-shadow-pixel border-4 border-pixelGray bg-pixelGray px-8 py-2 rounded-lg shadow-pixel" style={{ letterSpacing: 4 }}>
        CHARACTER SELECTION
      </div>
      <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-4xl mx-auto">
        {/* Portrait Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg shadow-pixel p-4 flex items-center justify-center" style={{ minWidth: 220, minHeight: 300 }}>
            <img src={current.img} alt={current.name} className="w-48 h-64 object-contain rounded-lg" />
          </div>
          <div className="text-pixelYellow font-pixel text-xl mt-2">{current.name}</div>
          <div className="text-pixelYellow font-pixel text-sm text-center max-w-xs mb-2">{current.bio}</div>
        </div>
        {/* Portrait Selector & Background Picker */}
        <div className="flex flex-col gap-8 items-center">
          <div className="flex gap-6">
            {PORTRAITS.map(p => (
              <button
                key={p.img}
                onClick={() => handleSelect(p.img)}
                className={`border-4 rounded-lg shadow-pixel p-1 transition-all btn-pixel ${selected === p.img ? 'border-pixelYellow bg-pixelGray' : 'border-pixelGray bg-pixelDark hover:border-pixelYellow'}`}
                aria-label={p.name}
              >
                <img src={p.img} alt={p.name} className="w-20 h-28 object-contain rounded" />
              </button>
            ))}
          </div>
          {/* Background Color Picker */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="text-pixelYellow font-pixel text-base mb-1">Background Color</div>
            <div className="flex gap-3">
              {BACKGROUND_COLORS.map(bg => (
                <button
                  key={bg.color}
                  onClick={() => handleBgColor(bg.color)}
                  className={`w-10 h-10 rounded-full border-4 shadow-pixel transition-all btn-pixel ${bgColor === bg.color ? 'border-pixelYellow scale-110' : 'border-pixelGray'} `}
                  style={{ background: bg.color }}
                  aria-label={bg.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <button 
        className={`mt-10 px-10 py-3 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Confirm'}
      </button>
      {success && (
        <div className="mt-4 text-pixelGreen font-pixel text-base bg-pixelGray border-2 border-pixelGreen rounded px-4 py-2">
          ✓ Saved successfully!
        </div>
      )}
    </div>
  );
} 