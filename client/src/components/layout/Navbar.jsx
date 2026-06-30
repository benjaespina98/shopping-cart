import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { Button } from '../../design-system/Button';

const navLinks = [
  { to: '/',          label: 'Inicio',    end: true },
  { to: '/servicios', label: 'Servicios', end: false },
  { to: '/proyectos', label: 'Proyectos', end: false },
  { to: '/nosotros',  label: 'Nosotros',  end: false },
  { to: '/tienda',    label: 'Tienda',    end: false },
  { to: '/contacto',  label: 'Contacto',  end: false },
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
        padding: mobile ? '10px 14px' : '8px 4px', borderRadius: mobile ? 'var(--radius-sm)' : 0,
        textDecoration: 'none', display: 'block',
        color: isActive ? 'var(--brand-primary)' : hovered ? 'var(--teal-600)' : 'var(--text-body)',
        background: mobile ? (isActive ? 'var(--teal-50)' : hovered ? 'var(--grey-50)' : 'transparent') : 'transparent',
        boxShadow: !mobile && isActive ? 'inset 0 -2px 0 0 var(--brand-accent)' : 'inset 0 -2px 0 0 transparent',
        transition: 'color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
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
  const location = useLocation();
  const showCart = location.pathname.startsWith('/tienda');

  const handleNav = (to) => { navigate(to); setMenuOpen(false); };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-8)' }}
           className="px-5 sm:px-10">

        {/* Logo */}
        <button onClick={() => handleNav('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                   display: 'flex', alignItems: 'center' }}>
          <img src="/brand/logo-horizontal.png" alt="Playa y Sol" style={{ height: 34, width: 'auto', display: 'block' }} />
        </button>

        {/* Desktop nav — hidden below lg to avoid cramming 6 links on tablet widths */}
        <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: 'var(--space-6)' }}>
          {navLinks.map((link) => <NavItem key={link.to} {...link} />)}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cart — only on /tienda, the rest of the site has no shopping context */}
          {showCart && (
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
                               color: 'var(--text-inverse)', fontSize: 11, fontWeight: 700, borderRadius: '50%',
                               width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          )}

          {/* Desktop CTA — hidden below lg */}
          <div className="hidden lg:block">
            <Button variant="primary" size="sm" onClick={() => handleNav('/presupuesto')}>
              Solicitar presupuesto
            </Button>
          </div>

          {/* Mobile hamburger — hidden on desktop */}
          <button className="lg:hidden"
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
        <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)',
                      padding: '12px 20px 16px', boxShadow: 'var(--shadow-md)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
            {navLinks.map((link) => (
              <NavItem key={link.to} {...link} mobile onClick={() => setMenuOpen(false)} />
            ))}
          </nav>
          <Button variant="primary" fullWidth onClick={() => handleNav('/presupuesto')}>
            Solicitar presupuesto
          </Button>
        </div>
      )}
    </header>
  );
}
