import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './components/Profile';
import CustomizeCharacter from './components/CustomizeCharacter';

const tabs = [
  { name: 'Dashboard', path: '/' },
  { name: 'Profile', path: '/profile' },
  { name: 'Customize', path: '/customize' },
];

function PixelNavbar() {
  const location = useLocation();
  return (
    <nav className="w-full flex justify-center py-4 bg-pixelGray border-b-4 border-pixelYellow shadow-pixel">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-6 py-2 rounded border-2 border-pixelYellow text-pixelYellow font-pixel text-lg tracking-widest transition-all duration-150 hover:bg-pixelYellow hover:text-pixelGray ${location.pathname === tab.path ? 'bg-pixelYellow text-pixelGray' : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-pixelDark flex flex-col font-pixel">
      <PixelNavbar />
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-2">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customize" element={<CustomizeCharacter />} />
        </Routes>
      </main>
    </div>
  );
}
