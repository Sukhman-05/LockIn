import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BackgroundContext = createContext();

// Character themes for dynamic backgrounds
const CHARACTER_THEMES = {
  '/Character1.png': {
    name: 'Valiant Knight',
    background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #6b4423 100%)',
    accent: '#d4af37',
    stars: ['#fff', '#ffe066', '#d4af37']
  },
  '/Character2.png': {
    name: 'Arcane Sorceress', 
    background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #4a2c7a 100%)',
    accent: '#a259f7',
    stars: ['#fff', '#a259f7', '#b3e6ff', '#e6b3ff']
  },
  '/Character3.png': {
    name: 'Nimble Rogue',
    background: 'linear-gradient(135deg, #0f2e1a 0%, #1b4e2d 50%, #2c7a4a 100%)',
    accent: '#4ade80',
    stars: ['#fff', '#4ade80', '#22c55e', '#86efac']
  }
};

export function useBackground() {
  return useContext(BackgroundContext);
}

export function BackgroundProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [currentTheme, setCurrentTheme] = useState(CHARACTER_THEMES['/Character1.png']);
  const [portrait, setPortrait] = useState(
    profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png'
  );
  const theme = CHARACTER_THEMES[portrait] || CHARACTER_THEMES['/Character1.png'];

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${user?.token}` } });
        setProfile(res.data);
      } catch {}
    }
    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Apply global background
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'global-background-style';
    style.innerHTML = `
      @keyframes globalBgStars { 
        0% { background-position: 0 0; } 
        100% { background-position: 100px 100px; } 
      }
      .global-background {
        background: ${currentTheme.background} !important;
        background-size: cover !important;
        background-position: center !important;
        min-height: 100vh !important;
      }
      .global-stars {
        background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          ${currentTheme.stars.map((color, i) => 
            `<circle cx="${10 + i * 20}" cy="${10 + i * 15}" r="${1 + i * 0.3}" fill="${color}"/>`
          ).join('')}
        </svg>') !important;
        background-repeat: repeat !important;
        animation: globalBgStars 20s linear infinite !important;
        opacity: 0.3 !important;
      }`;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('global-background-style');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [currentTheme]);

  const value = {
    currentTheme,
    portrait,
    setPortrait,
    CHARACTER_THEMES
  };

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
} 