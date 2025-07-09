import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

function Dashboard() {
  const { user } = useAuth();
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
    <div className="max-w-2xl mx-auto p-4">
      <StudyPods user={user} />
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {profile && (
            <div className="mb-6">
              <p className="text-lg">XP: <span className="font-bold">{profile.xp}</span></p>
              <p className="text-lg">Level: <span className="font-bold">{profile.level}</span></p>
            </div>
          )}
          <div className="mb-6">
            <p className="text-lg">Total Focus Time: <span className="font-bold">{totalFocusMinutes} min</span></p>
            <p className="text-lg">Total Sessions: <span className="font-bold">{sessions.length}</span></p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Type</th>
                  <th className="py-2 px-4 border">Start</th>
                  <th className="py-2 px-4 border">End</th>
                  <th className="py-2 px-4 border">Duration (min)</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id}>
                    <td className="py-2 px-4 border">{s.type}</td>
                    <td className="py-2 px-4 border">{new Date(s.start).toLocaleString()}</td>
                    <td className="py-2 px-4 border">{new Date(s.end).toLocaleString()}</td>
                    <td className="py-2 px-4 border">{Math.round(s.duration / 60)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-2">Leaderboard</h3>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Username</th>
                  <th className="py-2 px-4 border">XP</th>
                  <th className="py-2 px-4 border">Level</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr key={u._id}>
                    <td className="py-2 px-4 border">{u.username}</td>
                    <td className="py-2 px-4 border">{u.xp}</td>
                    <td className="py-2 px-4 border">{u.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
    <div>
      {notif && <div className="mb-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded">{notif}</div>}
      <button className="px-4 py-2 bg-indigo-500 text-white rounded mb-4" onClick={() => setShowModal(true)}>Study Pods</button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowModal(false)}>&times;</button>
            {!pod ? (
              <>
                <h3 className="text-xl font-bold mb-2">Create or Join a Pod</h3>
                <button className="px-4 py-2 bg-green-500 text-white rounded mb-2 w-full" onClick={createPod}>Create Pod</button>
                <div className="my-2 text-center">or</div>
                <input type="text" placeholder="Enter Pod Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="mb-2 px-3 py-2 border rounded w-full" />
                <button className="px-4 py-2 bg-blue-500 text-white rounded w-full" onClick={joinPod}>Join Pod</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Pod Code: <span className="font-mono">{pod.code}</span></h3>
                <div className="mb-2">Members: {pod.users?.map(u => u.username).join(', ')}</div>
                <div className="flex flex-col items-center mb-2">
                  <div className="text-4xl font-mono mb-2">{Math.floor(timer/60).toString().padStart(2,'0')}:{(timer%60).toString().padStart(2,'0')}</div>
                  <div className="space-x-2">
                    <button onClick={start} className="px-3 py-1 bg-blue-500 text-white rounded" disabled={isRunning}>Start</button>
                    <button onClick={pause} className="px-3 py-1 bg-yellow-500 text-white rounded" disabled={!isRunning}>Pause</button>
                    <button onClick={reset} className="px-3 py-1 bg-gray-500 text-white rounded">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 