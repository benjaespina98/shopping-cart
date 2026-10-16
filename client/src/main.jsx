import React, { Suspense, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { afterLoadAndIdle } from './utils/idle';
import { lazyOptional } from './utils/lazyOptional';
import './index.css';

// react-toastify y su CSS salen del arranque: el contenedor se descarga después de load, en idle.
const ToastHost = lazyOptional(() => import('./components/ToastHost'));

function DeferredToasts() {
  const [ready, setReady] = useState(false);
  useEffect(() => { afterLoadAndIdle(() => setReady(true), { timeout: 2000, fallbackDelay: 1500 }); }, []);
  return ready ? <Suspense fallback={null}><ToastHost /></Suspense> : null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <DeferredToasts />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
