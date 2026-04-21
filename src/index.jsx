import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { AuthProvider, CartProvider } from './context';
import './index.css';

if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  window.__AERION_GA_ENABLED__ = import.meta.env.PROD;
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(container).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
