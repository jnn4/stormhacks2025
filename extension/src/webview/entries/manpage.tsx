// src/webview/entries/TerminalBuddyApp.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import TerminalBuddyApp from '../pages/TerminalBuddyApp';
import '../styles/global.css';

console.log('TerminalBuddyApp webview loaded');

function mountApp() {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <TerminalBuddyApp />
      </React.StrictMode>
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}