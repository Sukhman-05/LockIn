import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './utils/api';

const DEFAULT_BG = '#6b4423'; // Portrait 1 color

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
  const [currentTheme, setCurrentTheme] = useState({ background: DEFAULT_BG });
  const [portrait, setPortrait] = useState(
    profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png'
  );
  const [background, setBackground] = useState(
    profile.background || localStorage.getItem('selectedBackground') || DEFAULT_BG
  );

  // Fetch user profile on login to get background and portrait
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
        if (res.data.portrait) setPortrait(res.data.portrait);
        if (res.data.background) setBackground(res.data.background);
      } catch {}
    }
    if (user?.token) fetchProfile();
  }, [user]);

  // Update theme when background changes
  useEffect(() => {
    setCurrentTheme({ background });
  }, [background]);

  // Apply global background color
  useEffect(() => {
    document.body.style.background = background;
    return () => {
      document.body.style.background = '';
    };
  }, [background]);

  const value = {
    currentTheme,
    portrait,
    setPortrait,
    background,
    setBackground
  };

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
} 