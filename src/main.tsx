import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
  ANIMATIONS_STORAGE_KEY,
  REDUCED_MOTION_ATTRIBUTE,
} from './hooks/useAnimationsPreference';
import './styles/tokens.css';
import './styles/globals.css';

// Apply the saved "disable animations" preference before first paint to avoid a flash of motion.
if (window.localStorage.getItem(ANIMATIONS_STORAGE_KEY) === 'false') {
  document.documentElement.setAttribute(REDUCED_MOTION_ATTRIBUTE, '');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
