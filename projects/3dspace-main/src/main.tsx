import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { EventEmitter } from 'events';

// Polyfill EventEmitter.prototype.removeAllListeners for browser-side xml2js/rss-parser compatibility
if (EventEmitter && EventEmitter.prototype && typeof EventEmitter.prototype.removeAllListeners !== 'function') {
  EventEmitter.prototype.removeAllListeners = function (this: any, type?: any) {
    if (type) {
      if (this._events) {
        delete this._events[type];
      }
    } else {
      this._events = {};
    }
    return this;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
