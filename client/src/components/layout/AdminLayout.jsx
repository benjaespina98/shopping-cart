import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiUser, FiSettings, FiImage, FiActivity, FiLayout, FiTool,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard',     label: 'Dashboard',      Icon: FiGrid },
  { to: '/admin/sitio',         label: 'Sitio web',      Icon: FiLayout },
  { to: '/admin/servicios',     label: 'Servicios',      Icon: FiTool },
  { to: '/admin/productos',     label: 'Productos',      Icon: FiPackage },
  { to: '/admin/pedidos',       label: 'Pedidos',        Icon: FiShoppingBag },
  { to: '/admin/metricas',      label: 'Métricas',       Icon: FiBarChart2 },
  { to: '/admin/logs',          label: 'Logs',           Icon: FiActivity },
  { to: '/admin/galeria',       label: 'Galería',        Icon: FiImage },
  { to: '/admin/configuracion', label: 'Configuración',  Icon: FiSettings },
  { to: '/admin/perfil',        label: 'Mi perfil',      Icon: FiUser },
];

const BrandIcon = () => (
  <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="32" cy="22" r="13" fill="none" stroke="#FFC526" strokeWidth="6"/>
    <path d="M8 42 Q14 37 20 42 Q26 47 32 42 Q38 37 44 42 Q50 47 56 42" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <line x1="8" y1="52" x2="56" y2="52" stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

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
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F7F9' }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300
          ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
        style={{ background: '#122B33' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <BrandIcon />
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, lineHeight: 1, color: '#fff' }}>
                Playa &amp; Sol
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: '#FFC526', marginTop: 2 }}>
                Panel admin
              </div>
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setSideOpen(false)}>
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSideOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13,
                textDecoration: 'none', transition: 'all 140ms ease',
                background: isActive ? '#214C5A' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              })}
              className={({ isActive }) => isActive ? '' : 'hover:bg-white/8 hover:!text-white'}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                 style={{ background: '#214C5A', border: '2px solid #FFC526', flexShrink: 0 }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-red-900/30 hover:text-red-400"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
          >
            <FiLogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 flex items-center gap-4 px-4 sm:px-6 bg-white"
                style={{ borderBottom: '1px solid #E0E5E7' }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  onClick={() => setSideOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#6E797E' }}>
              Panel de administración
            </span>
          </div>
          {/* Breadcrumb separator could go here */}
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer"
               className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-primary-50"
               style={{ color: '#214C5A', border: '1px solid #BCD6DD' }}>
              <svg width="14" height="14" viewBox="0 0 64 64">
                <circle cx="32" cy="22" r="13" fill="none" stroke="#FFC526" strokeWidth="7"/>
                <path d="M8 42 Q14 37 20 42 Q26 47 32 42 Q38 37 44 42 Q50 47 56 42" stroke="#214C5A" strokeWidth="7" strokeLinecap="round" fill="none"/>
                <line x1="8" y1="52" x2="56" y2="52" stroke="#214C5A" strokeWidth="7" strokeLinecap="round"/>
              </svg>
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
