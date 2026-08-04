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
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <WhatsAppFloat />
      </div>
    </SettingsProvider>
  );
}
