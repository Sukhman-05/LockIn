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

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg h-8 w-8 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">Dashboard</Link>
            <Link to="/timer" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">Timer</Link>
            <button 
              onClick={logout} 
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md mx-auto text-center">
          {/* Main CTA */}
          <div className="space-y-4">
            {user ? (
              <>
                <Link 
                  to="/timer" 
                  className="block w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
                >
                  Start Focus Session
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block w-full py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium border border-gray-200"
                >
                  View Progress
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium border border-gray-200"
                >
                  Create Account
                </Link>
              </>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <main className="w-full max-w-sm mx-auto">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col items-center border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>
          {error && (
            <div className="mb-4 flex items-center bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center text-sm font-medium shadow-lg"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center w-full">
            <span className="text-gray-500 text-xs">Don't have an account? </span>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-xs">Sign Up</Link>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <main className="w-full max-w-sm mx-auto">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col items-center border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Account</h2>
          {error && (
            <div className="mb-4 flex items-center bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center text-sm font-medium shadow-lg"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center w-full">
            <span className="text-gray-500 text-xs">Already have an account? </span>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-xs">Sign In</Link>
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
