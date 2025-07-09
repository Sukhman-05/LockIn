import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

function Dashboard() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get('/api/sessions', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSessions(res.data);
      } catch (err) {
        setError('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(res.data);
      } catch {}
    };
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/leaderboard');
        setLeaderboard(res.data);
      } catch {}
    };
    fetchSessions();
    fetchProfile();
    fetchLeaderboard();
  }, [user]);

  const totalFocusSeconds = sessions
    .filter((s) => s.type === 'focus')
    .reduce((sum, s) => sum + s.duration, 0);
  const totalFocusMinutes = Math.floor(totalFocusSeconds / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <button 
            onClick={logout} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
          >
            Logout
          </button>
        </div>
        
        <StudyPods user={user} />
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            {profile && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
                    <p className="text-xs opacity-90">XP</p>
                    <p className="text-xl font-bold">{profile.xp}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
                    <p className="text-xs opacity-90">Level</p>
                    <p className="text-xl font-bold">{profile.level}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100 shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
                  <p className="text-xs opacity-90">Focus Time</p>
                  <p className="text-xl font-bold">{totalFocusMinutes}m</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-lg">
                  <p className="text-xs opacity-90">Sessions</p>
                  <p className="text-xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.type === 'focus' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {s.type}
                      </span>
                      <span className="text-sm text-gray-600">{Math.round(s.duration / 60)}m</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(s.start).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((u, index) => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm">{u.username}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{u.xp} XP</div>
                      <div className="text-xs text-gray-500">Level {u.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudyPods({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [pod, setPod] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const [notif, setNotif] = useState('');

  useEffect(() => {
    if (notif) {
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(notif);
      }
      const timeout = setTimeout(() => setNotif(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [notif]);

  const notify = (msg) => {
    setNotif(msg);
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const createPod = async () => {
    const res = await axios.post('/api/pods', {}, { headers: { Authorization: `Bearer ${user.token}` } });
    setPod(res.data);
    socket.emit('join_pod', res.data.code);
    notify('Locked In');
  };
  const joinPod = async () => {
    const res = await axios.post('/api/pods/join', { code: joinCode }, { headers: { Authorization: `Bearer ${user.token}` } });
    setPod(res.data);
    socket.emit('join_pod', res.data.code);
    notify('Locked In');
  };
  useEffect(() => {
    if (pod) {
      socket.emit('join_pod', pod.code);
      socket.on('timer_update', (t) => setTimer(t));
    }
    return () => socket.off('timer_update');
  }, [pod]);
  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return 25 * 60;
        }
        const next = prev - 1;
        socket.emit('timer_update', { podCode: pod.code, timer: next });
        return next;
      });
    }, 1000);
  };
  const pause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };
  const reset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimer(25 * 60);
    socket.emit('timer_update', { podCode: pod.code, timer: 25 * 60 });
  };
  return (
    <div className="mb-6">
      {notif && (
        <div className="mb-4 bg-indigo-100 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-xl flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {notif}
        </div>
      )}
      <button 
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg mb-4" 
        onClick={() => setShowModal(true)}
      >
        Study Pods
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative border border-gray-100">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={() => setShowModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-8">
              {!pod ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Create or Join a Pod</h3>
                  <button 
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold text-lg shadow-lg mb-4" 
                    onClick={createPod}
                  >
                    Create Pod
                  </button>
                  <div className="text-center text-gray-500 mb-4">or</div>
                  <input 
                    type="text" 
                    placeholder="Enter Pod Code" 
                    value={joinCode} 
                    onChange={e => setJoinCode(e.target.value.toUpperCase())} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-lg mb-4" 
                  />
                  <button 
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold text-lg shadow-lg" 
                    onClick={joinPod}
                  >
                    Join Pod
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Pod Code: <span className="font-mono text-indigo-600">{pod.code}</span>
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Members: {pod.users?.map(u => u.username).join(', ')}
                  </p>
                  <div className="flex flex-col items-center mb-6">
                    <div className="text-5xl font-mono font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.floor(timer/60).toString().padStart(2,'0')}:{(timer%60).toString().padStart(2,'0')}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={start} 
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={isRunning}
                      >
                        Start
                      </button>
                      <button 
                        onClick={pause} 
                        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isRunning}
                      >
                        Pause
                      </button>
                      <button 
                        onClick={reset} 
                        className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 