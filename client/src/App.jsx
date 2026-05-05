import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import ErrorBoundary from './components/ErrorBoundary';

const Landing = lazy(() => import('./pages/Landing'));
const Shop = lazy(() => import('./pages/Shop'));
const Contact = lazy(() => import('./pages/Contact'));
const Location = lazy(() => import('./pages/Location'));

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
const AdminMetrics   = lazy(() => import('./pages/admin/AdminMetrics'));
const AdminProfile   = lazy(() => import('./pages/admin/AdminProfile'));
const AdminGallery   = lazy(() => import('./pages/admin/AdminGallery'));
const AdminSettings  = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogs      = lazy(() => import('./pages/admin/AdminLogs'));

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
          <Route path="/contacto" element={<Suspense fallback={<PublicFallback />}><Contact /></Suspense>} />
          <Route path="/ubicacion" element={<Suspense fallback={<PublicFallback />}><Location /></Suspense>} />
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
        <Route path="productos" element={<AdminProducts />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="metricas" element={<AdminMetrics />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="galeria" element={<AdminGallery />} />
        <Route path="configuracion" element={<AdminSettings />} />
        <Route path="perfil" element={<AdminProfile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
