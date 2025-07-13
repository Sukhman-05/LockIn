import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { MusicProvider } from './MusicContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  </React.StrictMode>
);
