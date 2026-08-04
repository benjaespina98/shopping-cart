import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import ErrorBoundary from './components/ErrorBoundary';

const Landing = lazy(() => import('./pages/Landing'));
const Shop = lazy(() => import('./pages/Shop'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const Quote = lazy(() => import('./pages/Quote'));

const PublicFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Admin — carga solo cuando el usuario navega al panel
const AdminLayout    = lazy(() => import('./components/layout/AdminLayout'));
const AdminLogin     = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts  = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders    = lazy(() => import('./pages/admin/AdminOrders'));
const AdminQuotes    = lazy(() => import('./pages/admin/AdminQuotes'));
const AdminSettings  = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogs      = lazy(() => import('./pages/admin/AdminLogs'));
const AdminSite      = lazy(() => import('./pages/admin/AdminSite'));
const AdminServices  = lazy(() => import('./pages/admin/AdminServices'));

const AdminFallback = () => (
  <div className="flex items-center justify-center h-screen bg-slate-100">
    <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return user ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Suspense fallback={<PublicFallback />}><Landing /></Suspense>} />
          <Route path="/tienda" element={<Suspense fallback={<PublicFallback />}><Shop /></Suspense>} />
          <Route path="/nosotros" element={<Suspense fallback={<PublicFallback />}><About /></Suspense>} />
          <Route path="/contacto" element={<Suspense fallback={<PublicFallback />}><Contact /></Suspense>} />
          {/* La página de ubicación se fusionó con Contacto (mapa + dirección al pie).
              La ruta vieja sigue viva para no romper enlaces ya compartidos. */}
          <Route path="/ubicacion" element={<Navigate to="/contacto" replace />} />
          <Route path="/servicios" element={<Suspense fallback={<PublicFallback />}><Services /></Suspense>} />
          <Route path="/proyectos" element={<Suspense fallback={<PublicFallback />}><Projects /></Suspense>} />
          <Route path="/presupuesto" element={<Suspense fallback={<PublicFallback />}><Quote /></Suspense>} />
        </Route>

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />

      {/* Admin protected routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="sitio" element={<AdminSite />} />
        <Route path="servicios" element={<AdminServices />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="presupuestos" element={<AdminQuotes />} />
        {/* Métricas mostraba los mismos KPIs que el Dashboard con otro diseño.
            Quedó todo en Dashboard; la ruta vieja redirige. */}
        <Route path="metricas" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="configuracion" element={<AdminSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
