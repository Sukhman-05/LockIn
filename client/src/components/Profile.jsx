import React, { useEffect, useState } from 'react';
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

  // Get portrait
  const portrait = profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg p-8 flex flex-col items-center shadow-pixel w-full">
        {/* User Portrait */}
        <div className="mb-6">
          <img 
            src={portrait} 
            alt="User Portrait" 
            className="w-48 h-64 object-contain rounded-lg border-4 border-pixelYellow shadow-pixel bg-pixelGray/50" 
          />
        </div>
        
        {/* User Info */}
        <h2 className="text-xl text-pixelYellow mb-2 font-pixel">@{profile.username}</h2>
        <div className="text-pixelYellow text-xs mb-6 font-pixel">{profile.email}</div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
            <div className="text-pixelYellow text-xs font-pixel">Level</div>
            <div className="text-white text-xl font-pixel">{profile.level}</div>
          </div>
          <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
            <div className="text-pixelYellow text-xs font-pixel">XP</div>
            <div className="text-white text-xl font-pixel">{profile.xp}/{profile.xpMax || 100}</div>
          </div>
          <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
            <div className="text-pixelYellow text-xs font-pixel">HP</div>
            <div className="text-white text-xl font-pixel">{profile.hp}/100</div>
          </div>
          <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
            <div className="text-pixelYellow text-xs font-pixel">Streak</div>
            <div className="text-white text-xl font-pixel">{profile.streak || 0}</div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="w-full space-y-2 mb-6">
          <div className="flex justify-between items-center bg-pixelGray/30 border border-pixelYellow rounded px-3 py-2">
            <span className="text-pixelYellow text-xs font-pixel">Member Since</span>
            <span className="text-white text-xs font-pixel">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center bg-pixelGray/30 border border-pixelYellow rounded px-3 py-2">
            <span className="text-pixelYellow text-xs font-pixel">Last Login</span>
            <span className="text-white text-xs font-pixel">
              {profile.lastLoginDate ? new Date(profile.lastLoginDate).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
        
        <button className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel">
          Edit Profile
        </button>
      </div>
    </div>
  );
} 