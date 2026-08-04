import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiShoppingBag, FiAlertCircle, FiDollarSign, FiArrowRight,
  FiClock, FiMessageSquare, FiCheckCircle, FiBarChart2, FiExternalLink,
} from 'react-icons/fi';
import { metricsAPI, ordersAPI, quotesAPI } from '../../services/api';

const OrdersChart = lazy(() => import('./OrdersChart'));

// Esta pantalla absorbió la antigua "Métricas": las dos mostraban los mismos cuatro
// KPIs (productos activos, pedidos confirmados, sin stock, ventas confirmadas) con dos
// componentes StatCard distintos y dos lenguajes visuales distintos. Ahora hay un solo
// lugar donde mirar los números y un solo StatCard.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const THEME = {
  teal:    { bg: 'var(--teal-700)', tint: 'var(--teal-50)' },
  ocean:   { bg: 'var(--teal-600)', tint: 'var(--teal-100)' },
  danger:  { bg: 'var(--red-500)', tint: 'var(--red-100)' },
  gold:    { bg: 'var(--sun-700)', tint: 'var(--sun-100)' },
  green:   { bg: 'var(--green-500)', tint: 'var(--green-100)' },
  neutral: { bg: 'var(--grey-400)', tint: 'var(--grey-100)' },
};

const STATUS_LABELS = {
  whatsapp_sent: { label: 'Enviado WA', bg: 'var(--info-100)', color: 'var(--info-500)' },
  confirmed:     { label: 'Confirmado', bg: 'var(--green-100)', color: 'var(--green-500)' },
  cancelled:     { label: 'Cancelado',  bg: 'var(--red-100)', color: 'var(--red-500)' },
};

const cardStyle = { background: '#fff', borderRadius: 14, border: '1px solid var(--grey-200)' };

function StatCard({ icon: Icon, label, value, sub, theme = THEME.teal, to }) {
  const content = (
    <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  height: '100%', cursor: to ? 'pointer' : 'default' }}
         className={to ? 'transition-shadow hover:shadow-md' : ''}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} style={{ color: '#fff' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', fontFamily: 'var(--font-display)',
                    letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 3 }}>
          {label}
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal-900)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {sub && <p style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 4 }}>{sub}</p>}
      </div>
      {to && <FiArrowRight size={16} style={{ color: 'var(--grey-400)', flexShrink: 0 }} />}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-500)', fontFamily: 'var(--font-display)',
                 letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </h2>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [ordersTime, setOrdersTime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      metricsAPI.getSummary(),
      ordersAPI.getAll({ limit: 5 }),
      quotesAPI.getAll(),
      metricsAPI.getOrdersOverTime(30),
    ])
      .then(([sumRes, ordRes, quoteRes, timeRes]) => {
        setSummary(sumRes.data);
        setRecentOrders(ordRes.data.orders ?? []);
        setQuotes(quoteRes.data || []);
        setOrdersTime(timeRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newQuotes = quotes.filter((q) => q.status === 'new').length;
  const recentQuotes = quotes.filter((q) => new Date(q.createdAt).getTime() >= sevenDaysAgo).length;
  const contactedQuotes = quotes.filter((q) => q.status === 'contacted').length;
  const outOfStock = summary?.outOfStock ?? 0;

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 28, background: 'var(--grey-200)', borderRadius: 8, width: 180, marginBottom: 8 }} className="animate-pulse" />
          <div style={{ height: 16, background: 'var(--grey-200)', borderRadius: 6, width: 240 }} className="animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: 84, background: 'var(--grey-200)', borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
                       color: 'var(--teal-900)', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--grey-500)' }}>Resumen general del negocio</p>
        </div>
        {GA_ID && (
          <a href="https://analytics.google.com" target="_blank" rel="noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                      border: '1px solid var(--teal-200)', color: 'var(--teal-700)', fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-display)', textDecoration: 'none' }}>
            <FiBarChart2 size={14} /> Ver Analytics <FiExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Consultas — lo primero que mira el negocio cada mañana */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Consultas y presupuestos</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiClock} label="Sin responder" value={newQuotes} sub="Requieren contacto"
                    theme={newQuotes > 0 ? THEME.danger : THEME.green} to="/admin/presupuestos" />
          <StatCard icon={FiMessageSquare} label="Últimos 7 días" value={recentQuotes} sub="Consultas recientes"
                    theme={THEME.ocean} to="/admin/presupuestos" />
          <StatCard icon={FiCheckCircle} label="En seguimiento" value={contactedQuotes} sub="Ya contactadas"
                    theme={THEME.teal} to="/admin/presupuestos" />
          <StatCard icon={FiMessageSquare} label="Total recibidas" value={quotes.length} sub="Desde el inicio"
                    theme={THEME.neutral} to="/admin/presupuestos" />
        </div>
      </div>

      {/* Tienda */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Tienda online</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiDollarSign} label="Ventas confirmadas"
                    value={`$${(summary?.totalRevenue || 0).toLocaleString('es-AR')}`}
                    sub="Pedidos confirmados" theme={THEME.gold} />
          <StatCard icon={FiShoppingBag} label="Pedidos confirmados" value={summary?.confirmedOrders}
                    sub="Histórico" theme={THEME.ocean} to="/admin/pedidos" />
          <StatCard icon={FiPackage} label="Productos activos" value={summary?.activeProducts}
                    sub={`de ${summary?.totalProducts || 0} totales`} theme={THEME.teal} to="/admin/productos" />
          <StatCard icon={FiAlertCircle} label="Sin stock" value={outOfStock} sub="Productos activos"
                    theme={outOfStock > 0 ? THEME.danger : THEME.green} to="/admin/productos" />
        </div>
      </div>

      {/* Detalle */}
      <div className="grid lg:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>

        {/* Resumen del mes */}
        <div style={{ ...cardStyle, padding: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                       color: 'var(--teal-900)', marginBottom: 16 }}>Resumen del mes</h2>
          {[
            { label: 'Pedidos creados (30 días)',    value: summary?.recentOrders ?? 0 },
            { label: 'Ventas confirmadas (30 días)', value: `$${(summary?.recentRevenue || 0).toLocaleString('es-AR')}` },
            { label: 'Ticket promedio',              value: `$${Math.round(summary?.averageOrderValue || 0).toLocaleString('es-AR')}` },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      padding: '11px 0', fontSize: 13,
                                      borderBottom: i < arr.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
              <span style={{ color: 'var(--grey-500)' }}>{label}</span>
              <span style={{ fontWeight: 700, color: 'var(--teal-900)', fontFamily: 'var(--font-display)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Últimos pedidos */}
        <div style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--teal-900)' }}>
              Últimos pedidos
            </h2>
            <Link to="/admin/pedidos"
                  style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 600, textDecoration: 'none',
                           display: 'flex', alignItems: 'center', gap: 3 }}>
              Ver todos <FiArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--grey-400)', fontSize: 13 }}>
              No hay pedidos todavía
            </div>
          ) : (
            recentOrders.map((o, i) => {
              const st = STATUS_LABELS[o.status] || { label: o.status, bg: 'var(--grey-100)', color: 'var(--grey-500)' };
              return (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                          padding: '9px 0', fontSize: 13,
                                          borderBottom: i < recentOrders.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--grey-400)' }}>#{o._id.slice(-6)}</span>
                    <span style={{ color: 'var(--grey-600)', marginLeft: 6 }}>
                      {new Date(o.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal-900)', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                      ${o.total.toLocaleString('es-AR')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                   background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Evolución de pedidos — sólo si hay datos que graficar */}
      {ordersTime.length > 0 && (
        <div style={{ ...cardStyle, padding: 22, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                       color: 'var(--teal-900)', marginBottom: 16 }}>
            Pedidos por día — últimos 30 días
          </h2>
          <Suspense fallback={<div style={{ height: 200, background: '#F6F8F9', borderRadius: 10 }} className="animate-pulse" />}>
            <OrdersChart data={ordersTime} />
          </Suspense>
        </div>
      )}

      {!GA_ID && (
        <div style={{ ...cardStyle, borderStyle: 'dashed', padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--grey-100)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiBarChart2 size={19} style={{ color: 'var(--grey-400)' }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-600)' }}>Google Analytics no configurado</p>
            <p style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 2 }}>
              Cargá <code style={{ background: 'var(--grey-100)', padding: '1px 5px', borderRadius: 4 }}>VITE_GA_MEASUREMENT_ID</code>{' '}
              en Vercel para ver visitas, tráfico y conversiones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
