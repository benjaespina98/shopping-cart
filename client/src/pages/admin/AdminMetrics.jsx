import { useEffect, useState } from 'react';
import { FiMessageSquare, FiShoppingBag, FiPackage, FiAlertTriangle, FiExternalLink, FiBarChart2, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { metricsAPI, quotesAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function StatCard({ Icon, label, value, sub, color = 'text-slate-800', accent, onClick }) {
  const base = 'card p-5 flex flex-col gap-2';
  const cls = onClick ? `${base} cursor-pointer hover:shadow-md transition-shadow` : base;
  return (
    <div className={cls} onClick={onClick}>
      <div className="flex items-center justify-between">
        <span className={`p-2 rounded-lg ${accent || 'bg-slate-100'}`}>
          <Icon size={16} className={color} />
        </span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminMetrics() {
  const [summary, setSummary] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [ordersTime, setOrdersTime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [s, q, ot] = await Promise.all([
          metricsAPI.getSummary(),
          quotesAPI.getAll(),
          metricsAPI.getOrdersOverTime(30),
        ]);
        setSummary(s.data);
        setQuotes(q.data || []);
        setOrdersTime(ot.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newQuotes = quotes.filter((q) => q.status === 'new').length;
  const recentQuotes = quotes.filter((q) => new Date(q.createdAt).getTime() >= sevenDaysAgo).length;
  const confirmedRevenue = summary?.totalRevenue || 0;
  const confirmedOrders = summary?.confirmedOrders || 0;
  const outOfStock = summary?.outOfStock || 0;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Métricas</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Métricas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resumen de actividad del negocio</p>
        </div>
        {GA_ID && (
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary-700 hover:text-primary-700 transition-colors"
          >
            <FiBarChart2 size={15} /> Ver Analytics <FiExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Consultas — lo más importante para el negocio */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Consultas y presupuestos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={FiClock}
            label="Sin responder"
            value={newQuotes}
            sub="Requieren contacto"
            color={newQuotes > 0 ? 'text-amber-600' : 'text-green-600'}
            accent={newQuotes > 0 ? 'bg-amber-50' : 'bg-green-50'}
          />
          <StatCard
            Icon={FiMessageSquare}
            label="Últimos 7 días"
            value={recentQuotes}
            sub="Consultas recientes"
            color="text-primary-700"
            accent="bg-primary-50"
          />
          <StatCard
            Icon={FiCheckCircle}
            label="Total recibidas"
            value={quotes.length}
            sub="Desde el inicio"
            color="text-slate-700"
            accent="bg-slate-100"
          />
          <StatCard
            Icon={FiMessageSquare}
            label="Contactadas"
            value={quotes.filter((q) => q.status === 'contacted').length}
            sub="En seguimiento"
            color="text-teal-700"
            accent="bg-teal-50"
          />
        </div>
      </div>

      {/* Tienda */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Tienda online</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={FiTrendingUp}
            label="Ventas confirmadas"
            value={`$${confirmedRevenue.toLocaleString('es-AR')}`}
            sub="Pedidos confirmados"
            color="text-green-700"
            accent="bg-green-50"
          />
          <StatCard
            Icon={FiShoppingBag}
            label="Pedidos confirmados"
            value={confirmedOrders}
            sub="Últimos 30 días"
            color="text-primary-700"
            accent="bg-primary-50"
          />
          <StatCard
            Icon={FiPackage}
            label="Productos activos"
            value={summary?.activeProducts || 0}
            sub={`de ${summary?.totalProducts || 0} totales`}
            color="text-slate-700"
            accent="bg-slate-100"
          />
          <StatCard
            Icon={FiAlertTriangle}
            label="Sin stock"
            value={outOfStock}
            sub="Productos activos"
            color={outOfStock > 0 ? 'text-red-600' : 'text-green-600'}
            accent={outOfStock > 0 ? 'bg-red-50' : 'bg-green-50'}
          />
        </div>
      </div>

      {/* Gráfico pedidos — solo si hay datos */}
      {ordersTime.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Pedidos por día — últimos 30 días</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersTime} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F2" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                formatter={(v, n) => [v, n === 'confirmedOrders' ? 'Confirmados' : 'Total']}
                labelFormatter={(l) => `Fecha: ${l}`}
              />
              <Bar dataKey="count" fill="#BCD6DD" radius={[3, 3, 0, 0]} name="count" />
              <Bar dataKey="confirmedOrders" fill="#244B5A" radius={[3, 3, 0, 0]} name="confirmedOrders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analytics */}
      {GA_ID ? (
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <FiBarChart2 size={20} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Google Analytics conectado</p>
            <p className="text-xs text-slate-500 mt-0.5">Visitantes, páginas más vistas, canales de tráfico y más en el panel de GA.</p>
          </div>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex items-center gap-2 flex-shrink-0 text-xs"
          >
            Abrir Analytics <FiExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className="card p-5 flex items-center gap-4 border-dashed">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FiBarChart2 size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">Google Analytics no configurado</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Cargá <code className="bg-slate-100 px-1 rounded text-slate-600">VITE_GA_MEASUREMENT_ID</code> en Vercel para ver visitas, tráfico y conversiones acá.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
