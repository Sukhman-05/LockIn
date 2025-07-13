import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

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

export default function CustomizeCharacter() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem('selectedPortrait') || PORTRAITS[0].img;
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const current = PORTRAITS.find(p => p.img === selected) || PORTRAITS[0];

  const handleSelect = (img) => {
    setSelected(img);
    localStorage.setItem('selectedPortrait', img);
  };

  const handleConfirm = async () => {
    setError('');
    setSuccess(false);
    try {
      await axios.patch('/api/auth/me', { portrait: selected }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSuccess(true);
      localStorage.setItem('selectedPortrait', selected);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to save portrait.');
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
        {/* Portrait Selector */}
        <div className="flex flex-col gap-6 items-center">
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
        </div>
      </div>
      <button className="mt-10 px-10 py-3 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel" onClick={handleConfirm}>Confirm</button>
      {success && <div className="mt-4 text-pixelGreen font-pixel text-base">Portrait saved!</div>}
      {error && <div className="mt-4 text-pixelRed font-pixel text-base">{error}</div>}
    </div>
  );
} 