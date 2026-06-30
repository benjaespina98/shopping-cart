import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import WhatsAppFloat from '../ui/WhatsAppFloat';
import { initAnalytics, trackPageview } from '../../utils/analytics';
import { settingsAPI } from '../../services/api';

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageview(location.pathname); }, [location.pathname]);

  // Tema visual elegido en /admin/configuracion (solo radios/sombras —
  // colores de marca y tipografía nunca cambian). "default" no setea el
  // atributo, así el sitio usa los valores base de tokens.css.
  useEffect(() => {
    settingsAPI.getPublic()
      .then(({ data }) => {
        const theme = data?.theme;
        if (theme && theme !== 'default') {
          document.documentElement.setAttribute('data-theme', theme);
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      })
      .catch(() => {
        // Sin settings disponibles, queda el tema default.
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}
