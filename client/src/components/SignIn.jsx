import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelDark">
      <form onSubmit={handleSubmit} className="bg-pixelGray border-4 border-pixelYellow rounded-lg shadow-pixel p-8 flex flex-col gap-4 w-full max-w-xs">
        <h2 className="text-2xl text-pixelYellow font-pixel mb-2 text-center">Sign In</h2>
        {error && (
          <div className="flex items-center gap-2 bg-pixelRed/90 border-2 border-pixelRed text-white px-3 py-2 rounded font-pixel text-base mb-2 shadow-pixel animate-shake">
            <span className="text-2xl">❌</span>
            <span>{error}</span>
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="px-3 py-2 border-2 border-pixelYellow rounded font-pixel bg-pixelDark text-pixelYellow focus:outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-3 py-2 border-2 border-pixelYellow rounded font-pixel bg-pixelDark text-pixelYellow focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel flex items-center justify-center min-h-[2.5rem]">
          {loading ? <span className="animate-spin h-5 w-5 border-2 border-pixelGray border-t-pixelOrange rounded-full inline-block"></span> : 'Sign In'}
        </button>
        <div className="text-xs text-pixelYellow text-center mt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pixelOrange underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
} 