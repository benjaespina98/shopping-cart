import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiAlertCircle, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { metricsAPI } from '../../services/api';

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className={`card p-6 flex items-center gap-4 ${to ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? '—'}</p>
      </div>
      {to && <FiArrowRight size={16} className="ml-auto text-slate-400" />}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metricsAPI.getSummary()
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: FiPackage,
      label: 'Productos activos',
      value: summary?.activeProducts,
      color: 'bg-brand',
      to: '/admin/productos',
    },
    {
      icon: FiShoppingBag,
      label: 'Pedidos totales',
      value: summary?.totalOrders,
      color: 'bg-blue-500',
      to: '/admin/pedidos',
    },
    {
      icon: FiAlertCircle,
      label: 'Sin stock',
      value: summary?.outOfStock,
      color: summary?.outOfStock > 0 ? 'bg-red-500' : 'bg-slate-400',
      to: '/admin/productos',
    },
    {
      icon: FiDollarSign,
      label: 'Revenue total',
      value: `$${(summary?.totalRevenue || 0).toLocaleString('es-AR')}`,
      color: 'bg-green-500',
      to: '/admin/metricas',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Resumen general del negocio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Resumen del mes</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Pedidos (últimos 30 días)</span>
              <span className="font-semibold text-slate-900">{summary?.recentOrders ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Total productos</span>
              <span className="font-semibold text-slate-900">{summary?.totalProducts ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-600">Productos sin stock</span>
              <span className={`font-semibold ${summary?.outOfStock > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {summary?.outOfStock ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            <Link to="/admin/productos" className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light/20 transition-colors text-sm font-medium text-slate-700 group">
              Agregar nuevo producto
              <FiArrowRight size={15} className="text-slate-400 group-hover:text-brand" />
            </Link>
            <Link to="/admin/pedidos" className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light/20 transition-colors text-sm font-medium text-slate-700 group">
              Ver pedidos recientes
              <FiArrowRight size={15} className="text-slate-400 group-hover:text-brand" />
            </Link>
            <Link to="/admin/metricas" className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light/20 transition-colors text-sm font-medium text-slate-700 group">
              Ver métricas detalladas
              <FiArrowRight size={15} className="text-slate-400 group-hover:text-brand" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
