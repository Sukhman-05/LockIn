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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center border border-white/20">
          {message && (
            <div className="mb-6 w-full bg-indigo-100 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {message}
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isFocus ? 'Focus' : 'Break'} Session
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            {isFocus ? 'Time to lock in and get productive!' : 'Take a well-deserved break.'}
          </p>
          
          <div className="text-7xl md:text-8xl font-mono font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {formatTime(secondsLeft)}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={start} 
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Start'}
            </button>
            <button 
              onClick={pause} 
              className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!isRunning}
            >
              Pause
            </button>
            <button 
              onClick={reset} 
              className="flex-1 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              Reset
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              {isRunning ? 'Session Active' : 'Ready to Start'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer; 