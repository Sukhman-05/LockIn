import React, { useEffect, useState } from 'react';
import PixelAvatar from './PixelAvatar';
import { useAuth } from '../AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${user?.token}` } });
        setProfile(res.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (user?.token) fetchProfile();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-64"><span className="animate-spin h-8 w-8 border-4 border-pixelGray border-t-pixelYellow rounded-full"></span></div>;
  if (!profile) return <div className="text-pixelRed font-pixel text-lg">Failed to load profile.</div>;

  const avatar = JSON.parse(localStorage.getItem('pixelAvatar')) || {};
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg p-8 flex flex-col items-center shadow-pixel w-full">
        <PixelAvatar {...avatar} size={96} />
        <h2 className="text-xl text-pixelYellow mt-4 mb-2 font-pixel">@{profile.username}</h2>
        <div className="text-pixelYellow text-xs mb-4 font-pixel">{profile.email}</div>
        <div className="flex gap-8 text-pixelYellow text-sm mb-4 font-pixel">
          <div>Level <span className="text-white">{profile.level}</span></div>
          <div>XP <span className="text-white">{profile.xp}</span></div>
          <div>Streak <span className="text-white">{profile.streak}</span></div>
        </div>
        <button className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel">
          Edit Profile
        </button>
      </div>
    </div>
  );
} 