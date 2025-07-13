import React, { useState } from 'react';
import PixelAvatar, { getPresets } from './PixelAvatar';

const COLORS = {
  skin: ['#f9d6b8', '#eac086', '#c68642', '#8d5524'],
  hair: ['#23272e', '#a259f7', '#ffe066', '#ef4444', '#4ade80'],
  shirt: ['#3b82f6', '#ffae42', '#a259f7', '#4ade80', '#ef4444'],
  pants: ['#23272e', '#ffe066', '#a259f7', '#4ade80', '#ef4444'],
};

const GENDERS = [
  { label: '♂', value: 'male', color: 'text-blue-400' },
  { label: '♀', value: 'female', color: 'text-pink-400' },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PRESETS = getPresets();

export default function CustomizeCharacter() {
  const [avatar, setAvatar] = useState({
    skin: COLORS.skin[0],
    hair: COLORS.hair[0],
    shirt: COLORS.shirt[0],
    pants: COLORS.pants[0],
    gender: 'female',
    name: '',
    preset: null,
  });
  const [tab, setTab] = useState(0); // For future: body/hair/clothes tabs
  const [customMode, setCustomMode] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const handleChange = (type, value) => setAvatar(a => ({ ...a, [type]: value, preset: null }));
  const handleRandomize = () => {
    setAvatar(a => ({
      ...a,
      skin: randomChoice(COLORS.skin),
      hair: randomChoice(COLORS.hair),
      shirt: randomChoice(COLORS.shirt),
      pants: randomChoice(COLORS.pants),
      gender: randomChoice(GENDERS).value,
      name: '',
      preset: null,
    }));
    setCustomMode(true);
    setSelectedPreset(null);
  };
  const handleSave = () => {
    localStorage.setItem('pixelAvatar', JSON.stringify(avatar));
    alert('Character saved!');
  };
  const handlePresetSelect = (presetObj) => {
    setAvatar({ ...presetObj.avatarProps, name: presetObj.name, preset: presetObj.avatarProps.preset });
    setCustomMode(false);
    setSelectedPreset(presetObj);
  };
  const handleCustom = () => {
    setCustomMode(true);
    setSelectedPreset(null);
    setAvatar(a => ({ ...a, preset: null }));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-pixelDark py-8 px-2">
      {/* Header */}
      <div className="text-3xl md:text-4xl text-pixelYellow font-pixel mb-6 tracking-widest text-center drop-shadow-pixel border-4 border-pixelGray bg-pixelGray px-8 py-2 rounded-lg shadow-pixel" style={{ letterSpacing: 4 }}>
        CHARACTER CREATION
      </div>
      {/* Preset Selector */}
      <div className="flex flex-col items-center w-full max-w-4xl mb-6">
        <div className="flex gap-6 justify-center mb-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              className={`flex flex-col items-center border-4 rounded-lg p-2 shadow-pixel transition-all ${selectedPreset && selectedPreset.name === preset.name ? 'border-pixelYellow bg-pixelGray' : 'border-pixelGray bg-pixelDark hover:border-pixelYellow'}`}
              onClick={() => handlePresetSelect(preset)}
            >
              <PixelAvatar {...preset.avatarProps} size={64} />
              <span className="text-pixelYellow font-pixel text-xs mt-2">{preset.name}</span>
            </button>
          ))}
          <button
            className={`flex flex-col items-center border-4 rounded-lg p-2 shadow-pixel transition-all ${customMode ? 'border-pixelYellow bg-pixelGray' : 'border-pixelGray bg-pixelDark hover:border-pixelYellow'}`}
            onClick={handleCustom}
          >
            <span className="text-3xl">🎨</span>
            <span className="text-pixelYellow font-pixel text-xs mt-2">Custom</span>
          </button>
        </div>
        {selectedPreset && (
          <div className="text-pixelYellow text-sm font-pixel text-center max-w-xl mb-2">
            {selectedPreset.description}
          </div>
        )}
      </div>
      {/* Panel */}
      <div className="flex flex-col md:flex-row gap-8 bg-pixelGray border-4 border-pixelYellow rounded-lg shadow-pixel p-6 w-full max-w-4xl relative" style={{ backgroundImage: 'linear-gradient(90deg,rgba(0,0,0,0.08) 1px,transparent 1px),linear-gradient(rgba(0,0,0,0.08) 1px,transparent 1px)', backgroundSize: '24px 24px' }}>
        {/* Left: Profile Form */}
        <div className="flex-1 flex flex-col gap-4 min-w-[260px]">
          {/* Tabs (static icons for now) */}
          <div className="flex gap-2 mb-2">
            <button className="w-10 h-10 bg-pixelDark border-2 border-pixelYellow rounded flex items-center justify-center"><span role="img" aria-label="head">👤</span></button>
            <button className="w-10 h-10 bg-pixelDark border-2 border-pixelYellow rounded flex items-center justify-center"><span role="img" aria-label="hair">💇‍♀️</span></button>
            <button className="w-10 h-10 bg-pixelDark border-2 border-pixelYellow rounded flex items-center justify-center"><span role="img" aria-label="shirt">👕</span></button>
            <div className="flex-1" />
            <span className="text-pixelYellow text-sm font-pixel">PROFILE</span>
          </div>
          {/* Name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-pixelYellow font-pixel text-base w-20">NAME :</span>
            <input
              className="flex-1 px-2 py-1 bg-pixelDark border-2 border-pixelYellow rounded font-pixel text-pixelYellow text-base focus:outline-none"
              value={avatar.name}
              maxLength={16}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter name..."
              disabled={!customMode}
            />
            <button onClick={handleRandomize} className="ml-2 w-8 h-8 flex items-center justify-center bg-pixelGray border-2 border-pixelYellow rounded shadow-pixel hover:bg-pixelYellow transition-all" title="Randomize" disabled={!customMode}>
              🎲
            </button>
          </div>
          {/* Race (static for now) */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-pixelYellow font-pixel text-base w-20">RACE :</span>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-pixelDark border-2 border-pixelYellow rounded flex items-center justify-center">
                <PixelAvatar {...avatar} size={32} />
              </div>
              <div className="w-10 h-10 bg-pixelGray border-2 border-pixelYellow rounded flex items-center justify-center opacity-40">?</div>
              <div className="w-10 h-10 bg-pixelGray border-2 border-pixelYellow rounded flex items-center justify-center opacity-40">?</div>
            </div>
          </div>
          {/* Gender */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-pixelYellow font-pixel text-base w-20">GENDER :</span>
            <div className="flex gap-2">
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  className={`w-10 h-10 border-2 rounded flex items-center justify-center font-pixel text-xl ${avatar.gender === g.value ? 'bg-pixelYellow border-pixelOrange ' + g.color : 'bg-pixelGray border-pixelYellow text-pixelGray'}`}
                  onClick={() => handleChange('gender', g.value)}
                  disabled={!customMode}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {/* Skin Color */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-pixelYellow font-pixel text-base w-28">SKIN COLOR</span>
            <div className="flex gap-2">
              {COLORS.skin.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 border-2 ${avatar.skin === color ? 'border-pixelYellow' : 'border-pixelGray'} rounded bg-white`}
                  style={{ background: color }}
                  onClick={() => handleChange('skin', color)}
                  disabled={!customMode}
                />
              ))}
            </div>
          </div>
          {/* Back Button */}
          <button className="mt-4 px-6 py-2 bg-pixelGray text-pixelYellow border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all w-32" onClick={() => window.history.back()}>
            BACK
          </button>
        </div>
        {/* Right: Character Preview & Confirm */}
        <div className="flex flex-col items-center gap-4 min-w-[220px]">
          <div className="bg-pixelDark border-4 border-pixelYellow rounded-lg flex items-center justify-center p-4 mb-2" style={{ minWidth: 180, minHeight: 220 }}>
            <PixelAvatar {...avatar} size={96} />
          </div>
          <button className="px-6 py-2 bg-pixelGray text-pixelYellow border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all w-40" onClick={handleRandomize} disabled={!customMode}>
            RANDOMIZE
          </button>
          <button className="px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all w-40" onClick={handleSave}>
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
} 