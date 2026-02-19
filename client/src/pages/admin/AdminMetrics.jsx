import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { metricsAPI } from '../../services/api';

const COLORS = ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#075985', '#0c4a6e', '#164e63'];

const dayOptions = [7, 14, 30, 60, 90];

export default function AdminMetrics() {
  const [summary, setSummary] = useState(null);
  const [ordersTime, setOrdersTime] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [s, ot, tp, cats] = await Promise.all([
          metricsAPI.getSummary(),
          metricsAPI.getOrdersOverTime(days),
          metricsAPI.getTopProducts(),
          metricsAPI.getCategoryStats(),
        ]);
        setSummary(s.data);
        setOrdersTime(ot.data);
        setTopProducts(tp.data);
        setCategories(cats.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [days]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Métricas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Métricas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análisis de tu negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Período:</span>
          {dayOptions.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                days === d ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Revenue total', value: `$${(summary.totalRevenue || 0).toLocaleString('es-AR')}`, color: 'text-green-600' },
            { label: 'Pedidos totales', value: summary.totalOrders, color: 'text-brand' },
            { label: 'Productos activos', value: summary.activeProducts, color: 'text-blue-600' },
            { label: 'Sin stock', value: summary.outOfStock, color: summary.outOfStock > 0 ? 'text-red-500' : 'text-slate-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders over time */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Pedidos en el tiempo</h2>
          {ordersTime.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin datos para el período</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ordersTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [v, n === 'count' ? 'Pedidos' : 'Revenue']} labelFormatter={(l) => `Fecha: ${l}`} />
                <Line type="monotone" dataKey="count" stroke="#0369a1" strokeWidth={2} dot={false} name="count" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue over time */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Revenue en el tiempo</h2>
          {ordersTime.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin datos para el período</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString('es-AR')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0369a1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Top 10 productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v) => [v, 'Cantidad']} />
                <Bar dataKey="totalQuantity" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Categories */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Productos por categoría</h2>
          {categories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n, p) => [v, p.payload._id]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
