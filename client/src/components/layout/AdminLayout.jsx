import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag,
  FiLogOut, FiMenu, FiX, FiSettings, FiActivity, FiLayout, FiTool, FiMail,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

// Agrupado por tarea: primero lo que se mira todos los días, después el contenido del
// sitio, después la tienda y al final lo administrativo. "Métricas" ya no está: sus
// KPIs eran los mismos del Dashboard y ahora viven ahí.
const navGroups = [
  { title: '', items: [
    { to: '/admin/dashboard',    label: 'Dashboard', Icon: FiGrid },
    { to: '/admin/presupuestos', label: 'Consultas', Icon: FiMail },
  ] },
  { title: 'Sitio web', items: [
    { to: '/admin/sitio',      label: 'Proyectos', Icon: FiLayout },
    { to: '/admin/servicios',  label: 'Servicios', Icon: FiTool },
  ] },
  { title: 'Tienda', items: [
    { to: '/admin/productos', label: 'Productos', Icon: FiPackage },
    { to: '/admin/pedidos',   label: 'Pedidos',   Icon: FiShoppingBag },
  ] },
  { title: 'Sistema', items: [
    { to: '/admin/configuracion', label: 'Configuración', Icon: FiSettings },
    { to: '/admin/logs',          label: 'Registros',     Icon: FiActivity },
  ] },
];

function SidebarLink({ to, label, Icon, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10,
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
        textDecoration: 'none', transition: 'background 140ms ease, color 140ms ease',
        background: isActive ? 'var(--teal-700)' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: isActive || hovered ? '#fff' : 'rgba(255,255,255,0.55)',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={16} style={{ flexShrink: 0, opacity: isActive || hovered ? 1 : 0.75 }} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--teal-50)' }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300
          ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
        style={{ background: 'var(--teal-900)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col gap-1.5">
            <img src="/brand/logo-horizontal.png" alt="Playa & Sol" className="ps-logo-inverse" style={{ height: 22, width: 'auto', display: 'block' }} />
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--sun-500)', marginLeft: 2 }}>
              Panel admin
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setSideOpen(false)}>
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navGroups.map((group, i) => (
            <div key={group.title || i} style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: i > 0 ? 14 : 0 }}>
              {group.title && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                               color: 'rgba(255,255,255,0.3)', padding: '0 14px', marginBottom: 4 }}>
                  {group.title}
                </span>
              )}
              {group.items.map((item) => (
                <SidebarLink key={item.to} {...item} onClick={() => setSideOpen(false)} />
              ))}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                 style={{ background: 'var(--teal-700)', border: '2px solid var(--sun-500)', flexShrink: 0 }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: '#fff', fontFamily: 'var(--font-display)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', fontWeight: 500, background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <FiLogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-40 ps-scrim lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 flex items-center gap-4 px-4 sm:px-6 bg-white"
                style={{ borderBottom: '1px solid var(--grey-200)' }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  onClick={() => setSideOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--grey-500)' }}>
              Panel de administración
            </span>
          </div>
          {/* Breadcrumb separator could go here */}
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer"
               className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-primary-50"
               style={{ color: 'var(--teal-700)', border: '1px solid var(--teal-200)' }}>
              <img src="/brand/logo-icon.png" alt="" style={{ height: 14, width: 'auto', display: 'block' }} />
              Ver sitio
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
