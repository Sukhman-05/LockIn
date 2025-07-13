import React, { useState } from 'react';
import PixelAvatar from './PixelAvatar';

const COLORS = {
  skin: ['#f9d6b8', '#eac086', '#c68642', '#8d5524'],
  hair: ['#23272e', '#a259f7', '#ffe066', '#ef4444', '#4ade80'],
  shirt: ['#3b82f6', '#ffae42', '#a259f7', '#4ade80', '#ef4444'],
  pants: ['#23272e', '#ffe066', '#a259f7', '#4ade80', '#ef4444'],
};

export default function CustomizeCharacter() {
  const [avatar, setAvatar] = useState({
    skin: '#f9d6b8',
    hair: '#23272e',
    shirt: '#3b82f6',
    pants: '#23272e',
  });
  const handleChange = (type, value) => setAvatar(a => ({ ...a, [type]: value }));
  const handleSave = () => {
    localStorage.setItem('pixelAvatar', JSON.stringify(avatar));
    alert('Character saved!');
  };
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl text-pixelYellow mb-2">Customize Your Character</h2>
      <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg p-6 flex flex-col items-center shadow-pixel">
        <PixelAvatar {...avatar} size={128} />
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          {Object.entries(COLORS).map(([type, colors]) => (
            <div key={type} className="flex flex-col items-center">
              <span className="text-pixelYellow text-xs mb-2 uppercase">{type}</span>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 border-2 ${avatar[type] === color ? 'border-pixelYellow' : 'border-pixelGray'} rounded bg-white`}
                    style={{ background: color }}
                    onClick={() => handleChange(type, color)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-8 px-8 py-3 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelOrange hover:text-white transition-all"
          onClick={handleSave}
        >
          Save Character
        </button>
      </div>
    </div>
  );
} 