import { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFloat from '../ui/WhatsAppFloat';
import { initAnalytics, trackPageview } from '../../utils/analytics';
import { SettingsProvider } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { afterLoadAndIdle } from '../../utils/idle';

// El carrito empieza cerrado y es de los componentes más pesados del layout: su chunk se descarga
// después de load, en idle, o al instante si el visitante abre el carrito antes.
const CartDrawer = lazy(() => import('../ui/CartDrawer'));

export default function PublicLayout() {
  const location = useLocation();
  const { isOpen: cartOpen } = useCart();
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => { afterLoadAndIdle(() => setCartReady(true), { timeout: 3000, fallbackDelay: 2000 }); }, []);

  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageview(location.pathname); }, [location.pathname]);

  // En una SPA el navegador conserva el scroll al cambiar de ruta, así que se entraba
  // a la página nueva por la mitad. El tema visual lo aplica ahora SettingsProvider.
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <SettingsProvider>
      <div className="flex flex-col min-h-screen">
        {/* Primer elemento enfocable: lleva el foco al contenido sin recorrer la barra. Se
            maneja con onClick (y no con el hash) para no ensuciar la URL de la SPA. */}
        <a
          href="#contenido"
          className="ps-skip-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contenido')?.focus();
          }}
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido" tabIndex={-1} className="flex-1">
          <Outlet />
        </main>
        <Footer />
        {(cartReady || cartOpen) && (
          <Suspense fallback={null}>
            <CartDrawer />
          </Suspense>
        )}
        <WhatsAppFloat />
      </div>
    </SettingsProvider>
  );
}
