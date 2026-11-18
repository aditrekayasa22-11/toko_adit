import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                fontWeight: 500,
                padding: '10px 14px',
                boxShadow: '0 12px 40px -12px rgba(15, 23, 42, 0.4)',
              },
              success: {
                iconTheme: { primary: '#34d399', secondary: '#0f172a' },
              },
              error: {
                iconTheme: { primary: '#fb7185', secondary: '#0f172a' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
