import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function Timer({ onSessionComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const intervalRef = useRef(null);
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (message) {
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(message);
      }
      const timeout = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const notify = (msg) => {
    setMessage(msg);
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    notify('Locked In session started');
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          notify('Locked Out! Session complete');
          handleSessionComplete(isFocus);
          if (isFocus) {
            setIsFocus(false);
            return BREAK_MINUTES * 60;
          } else {
            setIsFocus(true);
            return FOCUS_MINUTES * 60;
          }
        }
        return prev - 1;
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
    setIsFocus(true);
    setSecondsLeft(FOCUS_MINUTES * 60);
  };

  const saveSession = async (isFocus) => {
    if (!user || !isFocus) return;
    const now = new Date();
    const session = {
      start: new Date(now.getTime() - FOCUS_MINUTES * 60 * 1000),
      end: now,
      duration: FOCUS_MINUTES * 60,
      type: 'focus',
    };
    try {
      await axios.post('/api/sessions', session, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleSessionComplete = (isFocus) => {
    saveSession(isFocus);
    if (onSessionComplete) onSessionComplete(isFocus);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {message && <div className="mb-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded">{message}</div>}
      <h2 className="text-2xl font-bold mb-2">{isFocus ? 'Focus' : 'Break'} Session</h2>
      <div className="text-6xl font-mono mb-4">{formatTime(secondsLeft)}</div>
      <div className="space-x-2">
        <button onClick={start} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isRunning}>Start</button>
        <button onClick={pause} className="px-4 py-2 bg-yellow-500 text-white rounded" disabled={!isRunning}>Pause</button>
        <button onClick={reset} className="px-4 py-2 bg-gray-500 text-white rounded">Reset</button>
      </div>
    </div>
  );
}

export default Timer; 