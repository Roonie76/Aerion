import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider, CartProvider } from './context';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(container).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
