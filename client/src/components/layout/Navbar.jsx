import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { Button } from '../../design-system/Button';

const navLinks = [
  { to: '/',          label: 'Inicio',    end: true },
  { to: '/servicios', label: 'Servicios', end: false },
  { to: '/proyectos', label: 'Proyectos', end: false },
  { to: '/tienda',    label: 'Tienda',    end: false },
];

const linkStyle = (isActive) => ({
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
  textDecoration: 'none', display: 'block',
  color: isActive ? 'var(--brand-primary)' : 'var(--text-body)',
  transition: 'color var(--duration-fast) var(--ease-out)',
});

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (to) => { navigate(to); setMenuOpen(false); };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px' }}
           className="px-5 sm:px-10">

        {/* Logo */}
        <button onClick={() => handleNav('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                   display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="32" cy="22" r="13" fill="none" stroke="#FFC526" strokeWidth="6"/>
            <path d="M8 42 Q14 37 20 42 Q26 47 32 42 Q38 37 44 42 Q50 47 56 42" stroke="#214C5A" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <line x1="8" y1="52" x2="56" y2="52" stroke="#214C5A" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--teal-700)' }}>Playa</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--sun-600)' }}>&amp; Sol</span>
        </button>

        {/* Desktop nav — hidden on mobile via className */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => linkStyle(isActive)}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cart */}
          <button onClick={toggleCart}
            style={{ position: 'relative', padding: 8, borderRadius: 12,
                     background: 'transparent', border: 'none', cursor: 'pointer',
                     color: 'var(--text-body)' }}
            aria-label="Carrito">
            <FiShoppingCart size={22} />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red-500)',
                             color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: '50%',
                             width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Desktop CTA — hidden on mobile */}
          <div className="hidden md:block">
            <Button variant="primary" size="sm" onClick={() => handleNav('/presupuesto')}>
              Pide presupuesto
            </Button>
          </div>

          {/* Mobile hamburger — hidden on desktop */}
          <button className="md:hidden"
            style={{ padding: 8, borderRadius: 12, background: 'transparent',
                     border: 'none', cursor: 'pointer', color: 'var(--text-body)' }}
            onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', background: '#fff',
                      padding: '12px 20px 16px', boxShadow: 'var(--shadow-md)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  ...linkStyle(isActive),
                  padding: '10px 14px',
                  background: isActive ? 'var(--teal-50)' : 'transparent',
                })}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Button variant="primary" fullWidth onClick={() => handleNav('/presupuesto')}>
            Pide presupuesto
          </Button>
        </div>
      )}
    </header>
  );
}
