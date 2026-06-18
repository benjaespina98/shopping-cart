import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiAlertCircle, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { metricsAPI, ordersAPI } from '../../services/api';

const STAT_THEME = {
  products:  { bg: '#214C5A', light: '#F1F7F9', text: '#214C5A' },
  orders:    { bg: '#2B5C6D', light: '#DEEBEF', text: '#2B5C6D' },
  stock:     { bg: '#D6452E', light: '#FBE2DC', text: '#D6452E' },
  revenue:   { bg: '#C28C0A', light: '#FFF4D2', text: '#C28C0A' },
};

const STATUS_LABELS = {
  whatsapp_sent: { label: 'Enviado WA',  bg: '#DDEEF6', color: '#2F7FA6' },
  confirmed:     { label: 'Confirmado',  bg: '#DCF3E8', color: '#2E9E6B' },
  cancelled:     { label: 'Cancelado',   bg: '#FBE2DC', color: '#D6452E' },
};

function StatCard({ icon: Icon, label, value, theme, to }) {
  const content = (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E0E5E7',
                  padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'box-shadow 140ms ease, transform 140ms ease',
                  cursor: to ? 'pointer' : 'default' }}
         className={to ? 'hover:shadow-md hover:-translate-y-0.5' : ''}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: theme.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color: '#fff' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6E797E', fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, color: '#122B33', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
      </div>
      {to && <FiArrowRight size={16} style={{ color: '#9AA5AA', flexShrink: 0 }} />}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      metricsAPI.getSummary(),
      ordersAPI.getAll({ limit: 5 }),
    ])
      .then(([sumRes, ordRes]) => {
        setSummary(sumRes.data);
        setRecentOrders(ordRes.data.orders ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = summary ? [
    { icon: FiPackage,     label: 'Productos activos',   value: summary.activeProducts,    theme: STAT_THEME.products, to: '/admin/productos' },
    { icon: FiShoppingBag, label: 'Pedidos confirmados', value: summary.confirmedOrders,   theme: STAT_THEME.orders,   to: '/admin/pedidos' },
    { icon: FiAlertCircle, label: 'Sin stock',           value: summary.outOfStock,        theme: summary.outOfStock > 0 ? STAT_THEME.stock : { bg: '#9AA5AA', light: '#EEF1F2', text: '#6E797E' }, to: '/admin/productos' },
    { icon: FiDollarSign,  label: 'Ventas confirmadas',  value: `$${(summary.totalRevenue || 0).toLocaleString('es-AR')}`, theme: STAT_THEME.revenue, to: '/admin/metricas' },
  ] : [];

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 28, background: '#E0E5E7', borderRadius: 8, width: 180, marginBottom: 8 }} className="animate-pulse" />
          <div style={{ height: 16, background: '#E0E5E7', borderRadius: 6, width: 240 }} className="animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: 88, background: '#E0E5E7', borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24,
                     color: '#122B33', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6E797E' }}>Resumen general del negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Lower grid */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Monthly summary */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E0E5E7', padding: 22 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15,
                       color: '#122B33', marginBottom: 16 }}>Resumen del mes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Pedidos creados (30 días)',    value: summary?.recentOrders ?? 0 },
              { label: 'Ventas confirmadas (30 días)', value: `$${(summary?.recentRevenue || 0).toLocaleString('es-AR')}` },
              { label: 'Ticket promedio',              value: `$${Math.round(summary?.averageOrderValue || 0).toLocaleString('es-AR')}` },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '11px 0', fontSize: 13,
                                        borderBottom: i < arr.length - 1 ? '1px solid #EEF1F2' : 'none' }}>
                <span style={{ color: '#6E797E' }}>{label}</span>
                <span style={{ fontWeight: 700, color: '#122B33', fontFamily: 'Poppins, sans-serif' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E0E5E7', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, color: '#122B33' }}>
              Últimos pedidos
            </h2>
            <Link to="/admin/pedidos"
                  style={{ fontSize: 12, color: '#214C5A', fontWeight: 600, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 3 }}>
              Ver todos <FiArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9AA5AA', fontSize: 13 }}>
              No hay pedidos todavía
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentOrders.map((o, i) => {
                const st = STATUS_LABELS[o.status] || { label: o.status, bg: '#EEF1F2', color: '#6E797E' };
                return (
                  <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                             padding: '9px 0', fontSize: 13,
                                             borderBottom: i < recentOrders.length - 1 ? '1px solid #EEF1F2' : 'none' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9AA5AA' }}>#{o._id.slice(-6)}</span>
                      <span style={{ color: '#4D5862', marginLeft: 6 }}>
                        {new Date(o.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: '#122B33', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
                        ${o.total.toLocaleString('es-AR')}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                     background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
