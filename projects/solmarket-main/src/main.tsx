import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Gracefully absorb sandbox HMR WebSocket disconnections, session timeouts, or benign transport warnings
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('WebSocket') || 
      reasonStr.includes('websocket') || 
      reasonStr.includes('Transport request timed out') ||
      reasonStr.includes('session')
    ) {
      event.preventDefault(); // Suppress double reporting of unhandled rejection in the dev panel
      console.debug('Pythian Security Shield: Absorb benign sandboxed network rejection:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') ||
      msg.includes('session') ||
      msg.includes('Transport') ||
      msg.includes('timeout')
    ) {
      event.preventDefault(); // Catch raw transport failures gracefully
      console.debug('Pythian Security Shield: Absorb benign sandboxed network logging:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

