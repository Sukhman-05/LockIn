import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelDark">
      <form onSubmit={handleSubmit} className="bg-pixelGray border-4 border-pixelYellow rounded-lg shadow-pixel p-8 flex flex-col gap-4 w-full max-w-xs">
        <h2 className="text-2xl text-pixelYellow font-pixel mb-2 text-center">Sign Up</h2>
        {error && <div className="bg-pixelRed text-white px-2 py-1 rounded text-xs font-pixel text-center">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          className="px-3 py-2 border-2 border-pixelYellow rounded font-pixel bg-pixelDark text-pixelYellow focus:outline-none"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
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
        <button type="submit" className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all">Sign Up</button>
        <div className="text-xs text-pixelYellow text-center mt-2">
          Already have an account?{' '}
          <Link to="/signin" className="text-pixelOrange underline">Sign In</Link>
        </div>
      </form>
    </div>
  );
} 