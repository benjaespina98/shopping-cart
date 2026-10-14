import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import WhatsAppFloat from '../ui/WhatsAppFloat';
import { initAnalytics, trackPageview } from '../../utils/analytics';
import { SettingsProvider } from '../../context/SettingsContext';

export default function PublicLayout() {
  const location = useLocation();

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
        <CartDrawer />
        <WhatsAppFloat />
      </div>
    </SettingsProvider>
  );
}
