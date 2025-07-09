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
    <nav className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo />
          <span className="font-bold text-indigo-700 text-xl ml-2">Lock-In</span>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-indigo-600 hover:underline font-medium">Dashboard</Link>
            <Link to="/timer" className="text-indigo-600 hover:underline font-medium">Timer</Link>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <div className="bg-white/90 shadow-2xl rounded-3xl p-10 w-full max-w-xl flex flex-col items-center mt-16 mb-8">
          <Logo />
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-2 text-center leading-tight">Lock-In</h1>
          <p className="text-lg text-gray-500 mb-8 text-center">A beautiful, gamified focus app for students. Stay productive, earn rewards, and lock in together.</p>
          {user ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <Link to="/dashboard" className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-center text-lg font-semibold shadow">Go to Dashboard</Link>
              <Link to="/timer" className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-center text-lg font-semibold shadow">Start Timer</Link>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full">
              <Link to="/login" className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-center text-lg font-semibold shadow">Login</Link>
              <Link to="/register" className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-center text-lg font-semibold shadow">Register</Link>
            </div>
          )}
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/90 shadow-2xl rounded-3xl p-10 flex flex-col items-center mt-12">
          <Logo />
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">Welcome Back!</h2>
          <p className="text-gray-500 mb-6">Log in to lock in your focus</p>
          {error && (
            <div className="mb-4 flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-xl w-full">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center text-lg font-semibold shadow"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Log In'}
            </button>
          </form>
          <div className="mt-6 text-center w-full">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="text-indigo-600 hover:underline font-semibold">Register</Link>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/90 shadow-2xl rounded-3xl p-10 flex flex-col items-center mt-12">
          <Logo />
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">Join and start locking in your focus</p>
          {error && (
            <div className="mb-4 flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-xl w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-xl w-full">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center text-lg font-semibold shadow"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Register'}
            </button>
          </form>
          <div className="mt-6 text-center w-full">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Login</Link>
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
