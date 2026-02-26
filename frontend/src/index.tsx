import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
        },
      }}
    />
    <App />
  </React.StrictMode>
);
