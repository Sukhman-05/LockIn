import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/auth/me');
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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 px-2 md:px-0">
      <div className="text-center mb-4 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-pixel text-pixelYellow mb-2" style={{ textShadow: '0 0 8px #ffe066, 0 0 2px #fff' }}>
          Profile
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
        {/* Avatar/Info */}
        <div className="flex flex-col items-center bg-pixelGray/80 border-4 border-pixelYellow rounded-lg shadow-pixel p-4 min-w-0 w-full md:max-w-xs flex-1">
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
        </div>
        {/* Stats/Other Info */}
        <div className="flex flex-col items-center justify-center bg-pixelGray/80 border-4 border-pixelYellow rounded-lg shadow-pixel p-4 flex-1 min-w-0 w-full">
          {/* Stats Grid - Redesigned */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
              <div className="text-pixelYellow text-xs font-pixel">Level</div>
              <div className="text-white text-2xl font-pixel">{profile.level}</div>
            </div>
            <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
              <div className="text-pixelYellow text-xs font-pixel">XP</div>
              <div className="text-pixelGreen text-xl font-pixel">{profile.xp} <span className='text-pixelYellow text-base'>/ {profile.xpMax || 100}</span></div>
              <div className="text-pixelYellow text-xs font-pixel mt-1">Experience Points</div>
            </div>
            <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
              <div className="text-pixelYellow text-xs font-pixel">HP</div>
              <div className="text-pixelRed text-xl font-pixel">{profile.hp} <span className='text-pixelYellow text-base'>/ 100</span></div>
              <div className="text-pixelYellow text-xs font-pixel mt-1">Health Points</div>
            </div>
            <div className="bg-pixelGray/50 border-2 border-pixelYellow rounded p-3 text-center">
              <div className="text-pixelYellow text-xs font-pixel">Streak</div>
              <div className="text-white text-2xl font-pixel">{profile.streak || 0}</div>
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
    </div>
  );
} 