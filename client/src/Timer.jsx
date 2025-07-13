import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const HP_LOSS_ON_QUIT = 10;

function playSound(url) {
  const audio = new window.Audio(url);
  audio.volume = 0.3;
  audio.play();
}

export default function Timer({ onSessionUpdate }) {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [showSettings, setShowSettings] = useState(false);
  const [feedback, setFeedback] = useState('');
  const intervalRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    setSecondsLeft(isFocus ? focusMinutes * 60 : breakMinutes * 60);
  }, [focusMinutes, breakMinutes, isFocus]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    playSound('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b2.mp3'); // start sound
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          handleSessionComplete(isFocus);
          playSound('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b2.mp3'); // complete sound
          if (isFocus) {
            setIsFocus(false);
            return breakMinutes * 60;
          } else {
            setIsFocus(true);
            return focusMinutes * 60;
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

  // Quit: reset while running = lose HP
  const reset = async () => {
    if (isRunning && user) {
      setFeedback('-10 HP (quit early!)');
      playSound('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b2.mp3'); // fail sound
      try {
        await axios.patch('/api/sessions/hp', { loss: HP_LOSS_ON_QUIT }, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (onSessionUpdate) onSessionUpdate();
      } catch {}
    }
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setIsFocus(true);
    setSecondsLeft(focusMinutes * 60);
  };

  // Save session and update XP/streak
  const saveSession = async () => {
    if (!user) return;
    const now = new Date();
    const duration = focusMinutes * 60;
    const session = {
      start: new Date(now.getTime() - duration * 1000),
      end: now,
      duration,
      type: 'focus',
    };
    try {
      await axios.post('/api/sessions', session, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFeedback(`+${focusMinutes} XP!`);
      if (onSessionUpdate) onSessionUpdate();
    } catch {}
  };

  const handleSessionComplete = (wasFocus) => {
    if (wasFocus) saveSession();
  };

  // Idle animation: pulsing timer
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-sm">
        <div className="bg-pixelGray border-4 border-pixelYellow rounded-lg shadow-pixel p-8 flex flex-col items-center">
          {feedback && (
            <div className="mb-4 w-full bg-pixelYellow text-pixelGray border-2 border-pixelOrange px-4 py-2 rounded font-pixel text-center animate-pulse">
              {feedback}
            </div>
          )}
          <h2 className="text-lg text-pixelYellow mb-2 font-pixel">
            {isFocus ? 'Focus' : 'Break'}
          </h2>
          <div className={`text-6xl font-pixel font-bold mb-8 text-center text-pixelYellow transition-all duration-500 ${pulse ? 'scale-110' : 'scale-100'}`}
            style={{ textShadow: '0 0 8px #ffe066, 0 0 2px #fff' }}>
            {formatTime(secondsLeft)}
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={start}
              className="flex-1 py-3 bg-pixelGreen text-pixelGray border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRunning}
            >
              {isRunning ? 'Running' : 'Start'}
            </button>
            <button
              onClick={pause}
              className="flex-1 py-3 bg-pixelOrange text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isRunning}
            >
              Pause
            </button>
            <button
              onClick={reset}
              className="flex-1 py-3 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200"
            >
              Quit
            </button>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-pixelYellow text-pixelGray rounded-full text-xs font-pixel">
              <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-pixelGreen animate-pulse' : 'bg-pixelGray'}`}></div>
              {isRunning ? 'Active' : 'Ready'}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-4 text-sm text-pixelYellow hover:text-pixelOrange font-pixel transition-colors"
          >
            ⚙️ Settings
          </button>
          {showSettings && (
            <div className="mt-4 p-4 bg-pixelGray border-2 border-pixelYellow rounded">
              <h4 className="text-sm font-pixel text-pixelYellow mb-3">Timer Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-pixelYellow mb-1 font-pixel">Focus Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={focusMinutes}
                    onChange={(e) => setFocusMinutes(Math.max(1, parseInt(e.target.value) || DEFAULT_FOCUS_MINUTES))}
                    className="w-full px-2 py-1 text-sm border border-pixelYellow rounded font-pixel bg-pixelGray text-pixelYellow"
                  />
                </div>
                <div>
                  <label className="block text-xs text-pixelYellow mb-1 font-pixel">Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || DEFAULT_BREAK_MINUTES))}
                    className="w-full px-2 py-1 text-sm border border-pixelYellow rounded font-pixel bg-pixelGray text-pixelYellow"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 