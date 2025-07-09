import { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Timer from './Timer';
import Dashboard from './Dashboard';

function Spinner() {
  return (
    <div className="flex justify-center items-center h-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400"></div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center justify-center mb-6">
      {/* Replace with your SVG logo if available */}
      <div className="bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full h-14 w-14 flex items-center justify-center shadow-md">
        <span className="text-white text-3xl font-bold select-none">L</span>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold select-none">L</span>
          </div>
          <span className="font-bold text-gray-900 text-xl">Lock-In</span>
        </div>
        {user && (
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
            <Link to="/timer" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Timer</Link>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tight">
              Lock-In
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The ultimate focus app for students. Stay productive, earn rewards, and lock in together.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pomodoro Timer</h3>
              <p className="text-gray-600">Stay focused with our proven 25/5 minute technique</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Study Pods</h3>
              <p className="text-gray-600">Join virtual study groups and stay motivated together</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gamification</h3>
              <p className="text-gray-600">Earn XP, level up, and compete on the leaderboard</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/50 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to lock in?
            </h2>
            {user ? (
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  to="/dashboard" 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link 
                  to="/timer" 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  Start Timer
                </Link>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.email || !form.password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.token);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-4">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center border border-white/50">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-2xl font-bold select-none">L</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-8 text-center">Log in to lock in your focus</p>
          {error && (
            <div className="mb-6 flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center text-lg font-semibold shadow-lg"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Log In'}
            </button>
          </form>
          <div className="mt-8 text-center w-full">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Register</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      await axios.post('/api/auth/register', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-4">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center border border-white/50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-2xl font-bold select-none">L</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8 text-center">Join and start locking in your focus</p>
          {error && (
            <div className="mb-6 flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center text-lg font-semibold shadow-lg"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Register'}
            </button>
          </form>
          <div className="mt-8 text-center w-full">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">Login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/timer" element={<ProtectedRoute><Timer /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
