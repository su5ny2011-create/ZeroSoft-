import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker safely
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('ZeroSoft update available');
      },
      onOfflineReady() {
        console.log('ZeroSoft is ready for offline use');
      },
    });
  } catch (err) {
    console.warn('PWA service worker registration notice:', err);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
