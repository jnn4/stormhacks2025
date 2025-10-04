import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Index.tsx loaded');
console.log('Document ready state:', document.readyState);

function mountApp() {
  console.log('Attempting to mount app...');
  const container = document.getElementById('root');
  console.log('Container element:', container);
  
  if (container) {
    console.log('Container found, creating root...');
    try {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('App rendered successfully!');
    } catch (error) {
      console.error('Error rendering app:', error);
    }
  } else {
    console.error('Root container not found!');
  }
}

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

