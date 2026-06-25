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

function NavItem({ to, label, end, onClick, mobile = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
        padding: mobile ? '10px 14px' : '8px 14px', borderRadius: 'var(--radius-sm)',
        textDecoration: 'none', display: 'block',
        color: isActive ? 'var(--brand-primary)' : hovered ? 'var(--teal-600)' : 'var(--text-body)',
        background: isActive ? 'var(--teal-50)' : hovered ? 'var(--grey-50)' : 'transparent',
        transition: 'color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
      })}
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [menuHover, setMenuHover] = useState(false);
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
          <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="50" cy="33" r="19" fill="none" stroke="#FFC526" strokeWidth="7"/>
            <path d="M10 64 Q20 57 30 64 Q40 71 50 64 Q60 57 70 64 Q80 71 90 64" stroke="#214C5A" strokeWidth="7" strokeLinecap="round" fill="none"/>
            <line x1="10" y1="80" x2="90" y2="80" stroke="#214C5A" strokeWidth="7" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--teal-700)' }}>Playa</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--sun-600)' }}>&amp; Sol</span>
        </button>

        {/* Desktop nav — hidden on mobile via className */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
          {navLinks.map((link) => <NavItem key={link.to} {...link} />)}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cart */}
          <button onClick={toggleCart}
            onMouseEnter={() => setCartHover(true)}
            onMouseLeave={() => setCartHover(false)}
            style={{ position: 'relative', padding: 8, borderRadius: 12,
                     background: cartHover ? 'var(--grey-50)' : 'transparent', border: 'none', cursor: 'pointer',
                     color: cartHover ? 'var(--brand-primary)' : 'var(--text-body)',
                     transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)' }}
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
            onMouseEnter={() => setMenuHover(true)}
            onMouseLeave={() => setMenuHover(false)}
            style={{ padding: 8, borderRadius: 12, background: menuHover ? 'var(--grey-50)' : 'transparent',
                     border: 'none', cursor: 'pointer', color: 'var(--text-body)',
                     transition: 'background var(--duration-fast) var(--ease-out)' }}
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
            {navLinks.map((link) => (
              <NavItem key={link.to} {...link} mobile onClick={() => setMenuOpen(false)} />
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
