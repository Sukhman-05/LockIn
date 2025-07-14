import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Connecting to server...');
    
    // Progressive loading messages for better UX
    const loadingMessages = [
      'Connecting to server...',
      'Verifying credentials...',
      'Setting up your session...',
      'Almost there...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (loading && messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, 2000);
    
    // Add timeout for better UX
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingMessage('This is taking longer than usual. Please wait...');
      }
    }, 8000);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      clearTimeout(timeoutId);
      clearInterval(messageInterval);
      
      setLoadingMessage('Login successful! Redirecting...');
      
      // Small delay to show success message
      setTimeout(() => {
        login(res.data.token);
        navigate('/');
      }, 500);
      
    } catch (err) {
      clearTimeout(timeoutId);
      clearInterval(messageInterval);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMessage('');
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
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-3 py-2 border-2 border-pixelYellow rounded font-pixel bg-pixelDark text-pixelYellow focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          className="mt-2 px-6 py-2 bg-pixelYellow text-pixelGray border-2 border-pixelYellow rounded font-pixel text-base shadow-pixel hover:bg-pixelOrange hover:text-white transition-all btn-pixel flex items-center justify-center min-h-[2.5rem]"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-pixelGray border-t-pixelOrange rounded-full inline-block"></span>
              <span className="text-sm">{loadingMessage}</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
        <div className="text-xs text-pixelYellow text-center mt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pixelOrange underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
} 