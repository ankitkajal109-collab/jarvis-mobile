import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[JARVIS PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[JARVIS PWA] Service Worker registration notice:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
