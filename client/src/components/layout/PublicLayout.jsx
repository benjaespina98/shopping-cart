import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import WhatsAppFloat from '../ui/WhatsAppFloat';
import { initAnalytics, trackPageview } from '../../utils/analytics';

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageview(location.pathname); }, [location.pathname]);

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
