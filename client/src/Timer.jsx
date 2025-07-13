import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './utils/api';
import { useAuth } from './AuthContext';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const HP_LOSS_ON_QUIT = 10;

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
  const [stats, setStats] = useState({ totalFocus: 0, sessions: 0, streak: 0 });
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [profile, setProfile] = useState({});
  const intervalRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get portrait and theme
  const portrait = profile.portrait || localStorage.getItem('selectedPortrait') || '/Character1.png';
  const theme = CHARACTER_THEMES[portrait] || CHARACTER_THEMES['/Character1.png'];

  useEffect(() => {
    setSecondsLeft(isFocus ? focusMinutes * 60 : breakMinutes * 60);
  }, [focusMinutes, breakMinutes, isFocus]);

  useEffect(() => {
    // Fetch profile and stats from backend
    async function fetchProfile() {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
      } catch {}
    }
    async function fetchStats() {
      try {
        const res = await api.get('/sessions/stats');
        setStats({
          totalFocus: res.data.totalFocusTime || 0,
          sessions: res.data.totalSessions || 0,
          streak: res.data.streak || 0
        });
      } catch {}
    }
    if (user?.token) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

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
        await api.patch('/sessions/hp', { loss: HP_LOSS_ON_QUIT });
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
      await api.post('/sessions', session);
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

  // Task logic
  const addTask = () => {
    const trimmedInput = taskInput.trim();
    if (trimmedInput) {
      const newTask = { text: trimmedInput, done: false, id: Date.now() };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTaskInput('');
      console.log('Task added:', newTask);
    }
  };
  
  const toggleTask = (idx) => {
    setTasks(prevTasks => 
      prevTasks.map((task, i) => 
        i === idx ? { ...task, done: !task.done } : task
      )
    );
    console.log('Task toggled at index:', idx);
  };
  
  const removeTask = (idx) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.filter((_, i) => i !== idx);
      console.log('Task removed at index:', idx, 'New tasks:', newTasks);
      return newTasks;
    });
  };

  const handleTaskInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      
      {/* Back Button */}
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 px-4 py-2 bg-pixelGray text-pixelYellow border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all btn-pixel z-10">
        ← Back
      </button>
      
      {/* Character Portrait */}
      <div className="absolute top-4 right-4 flex flex-col items-center z-10">
        <img 
          src={portrait} 
          alt="Character Portrait" 
          className="w-24 h-32 object-contain rounded-lg border-4 border-pixelYellow shadow-pixel bg-pixelGray/80 backdrop-blur-sm" 
        />
        <div className="mt-2 px-3 py-1 bg-pixelGray/80 backdrop-blur-sm border-2 border-pixelYellow rounded font-pixel text-xs text-pixelYellow text-center">
          {theme.name}
        </div>
        {profile.username && (
          <div className="mt-1 px-3 py-1 bg-pixelGray/80 backdrop-blur-sm border-2 border-pixelYellow rounded font-pixel text-xs text-pixelYellow text-center">
            @{profile.username}
          </div>
        )}
      </div>
      {/* Stats */}
      <div className="mb-4 w-full max-w-sm flex flex-col items-center gap-2">
        <div className="flex gap-4 justify-center">
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">Total Focus: {Math.round(stats.totalFocus / 60)} min</div>
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">Sessions: {stats.sessions}</div>
          <div className="bg-pixelGray border-2 border-pixelYellow rounded px-3 py-1 font-pixel text-pixelYellow text-xs">Streak: {stats.streak}</div>
        </div>
      </div>
      {/* Task List */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-pixelYellow font-pixel text-sm">Tasks ({tasks.length})</h3>
          <div className="text-pixelYellow/60 font-pixel text-xs">
            {tasks.filter(t => t.done).length}/{tasks.length} completed
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 px-2 py-1 border-2 border-pixelYellow rounded font-pixel bg-pixelGray text-pixelYellow focus:outline-none focus:border-pixelOrange transition-colors"
            placeholder="Add a task..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            onKeyDown={handleTaskInputKeyDown}
            maxLength={100}
          />
          <button 
            onClick={addTask} 
            disabled={!taskInput.trim()}
            className="px-4 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-sm shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {tasks.map((task, idx) => (
            <li key={task.id || idx} className="flex items-center gap-2 bg-pixelGray border-2 border-pixelYellow rounded px-3 py-2 transition-all hover:bg-pixelGray/80">
              <input 
                type="checkbox" 
                checked={task.done} 
                onChange={() => toggleTask(idx)} 
                className="accent-pixelYellow w-5 h-5 cursor-pointer" 
              />
              <span className={`flex-1 font-pixel text-pixelYellow text-sm ${task.done ? 'line-through opacity-60' : ''}`}>
                {task.text}
              </span>
              <button 
                onClick={() => removeTask(idx)} 
                className="text-pixelRed font-bold btn-pixel hover:text-red-400 transition-colors"
                title="Remove task"
              >
                ✕
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-center text-pixelYellow/60 font-pixel text-sm py-4">
              No tasks yet. Add some tasks to track your progress!
            </li>
          )}
        </ul>
      </div>
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
              className="flex-1 py-3 bg-pixelGreen text-pixelGray border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-pixel"
              disabled={isRunning}
            >
              {isRunning ? 'Running' : 'Start'}
            </button>
            <button
              onClick={pause}
              className="flex-1 py-3 bg-pixelOrange text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-pixel"
              disabled={!isRunning}
            >
              Pause
            </button>
            <button
              onClick={reset}
              className="flex-1 py-3 bg-pixelRed text-white border-2 border-pixelYellow rounded font-pixel text-lg shadow-pixel hover:bg-pixelYellow hover:text-pixelGray transition-all duration-200 btn-pixel"
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
            className="mt-4 text-sm text-pixelYellow hover:text-pixelOrange font-pixel transition-colors btn-pixel"
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