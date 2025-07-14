import React, { createContext, useContext, useState, useEffect } from 'react';

const MusicContext = createContext();

export function useMusic() {
  return useContext(MusicContext);
}

export function MusicProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    // Create audio element once
    let musicAudio = document.getElementById('bg-music');
    if (!musicAudio) {
      musicAudio = document.createElement('audio');
      musicAudio.id = 'bg-music';
      musicAudio.src = '/music.mp3';
      musicAudio.loop = true;
      musicAudio.volume = 0.2;
      musicAudio.preload = 'auto';
      document.body.appendChild(musicAudio);
    }
    setAudio(musicAudio);

    // Try to play music (may fail due to autoplay restrictions)
    const playMusic = async () => {
      try {
        await musicAudio.play();
        // Music started successfully
      } catch (error) {
        // Autoplay prevented. User interaction required to start music.
        const startMusicOnInteraction = () => {
          musicAudio.play().catch(() => {});
          document.removeEventListener('click', startMusicOnInteraction);
        };
        document.addEventListener('click', startMusicOnInteraction);
      }
    };

    playMusic();

    return () => {
      if (musicAudio) {
        musicAudio.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audio) {
      audio.volume = muted ? 0 : 0.2;
    }
  }, [muted, audio]);

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  const value = {
    muted,
    toggleMute,
    audio
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
} 