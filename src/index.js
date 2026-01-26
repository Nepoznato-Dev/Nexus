import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeAntiTheft } from './utils/antiTheft'; // Corrected import name

// Initialize anti-theft protection
initializeAntiTheft(); // Ensure this matches the original function name

console.log('Nexus starting...');

// Skip mounting if the page already spawned the about:blank wrapper
if (!window.__NEXUS_SKIP_APP__) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

console.log('Nexus rendered');