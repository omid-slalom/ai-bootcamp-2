import React from 'react';
import { Toaster } from 'react-hot-toast';

const toastOptions = {
  duration: 3000,
  style: {
    borderRadius: '12px',
    background: '#2D5016',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  success: { iconTheme: { primary: '#A8D5BA', secondary: '#2D5016' } },
  error: { style: { background: '#8b2e2e', color: '#fff', borderRadius: '12px' } },
};

function ToastHost() {
  return <Toaster position="top-right" toastOptions={toastOptions} />;
}

export default ToastHost;
