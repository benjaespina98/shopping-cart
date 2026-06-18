import { FiInstagram, FiFacebook } from 'react-icons/fi';

const cols = [
  { title: 'Servicios', items: [['/servicios', 'Piscinas de obra'], ['/servicios', 'Reformas'], ['/servicios', 'Climatización'], ['/servicios', 'Cercos y seguridad']] },
  { title: 'Empresa',   items: [['/proyectos', 'Proyectos'], ['/servicios', 'Servicios'], ['/tienda', 'Tienda'], ['/admin/login', 'Portal admin']] },
  { title: 'Contacto',  items: [['tel:+543534224607', '+54 353 422-4607'], ['mailto:piscinas@playaysol.com.ar', 'piscinas@playaysol.com.ar'], ['#', 'Villa María, Córdoba']] },
];

const linkHover = (e, on) => { e.currentTarget.style.color = on ? '#fff' : 'rgba(255,255,255,0.7)'; };
const iconHover = (e, on) => { e.currentTarget.style.background = on ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'; };

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-800)', color: 'rgba(255,255,255,0.78)', padding: '48px 40px 28px', fontFamily: 'var(--font-body)' }}
            className="ps-section">
      <div className="ps-footer-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, whiteSpace: 'nowrap' }}>
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
              <rect width="32" height="32" rx="6" fill="rgba(255,255,255,0.15)"/>
              <circle cx="22" cy="10" r="5.5" fill="#FFC526"/>
              <path d="M0 22 Q4 17 8 22 Q12 27 16 22 Q20 17 24 22 Q28 27 32 22 L32 32 L0 32 Z" fill="#7DD3FC"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Playa</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--sun-400)' }}>&amp; Sol</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240, marginBottom: 18 }}>
            Diseño, construcción y mantenimiento de piscinas en Villa María y la región desde 2004.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['https://instagram.com', FiInstagram], ['https://facebook.com', FiFacebook]].map(([href, Icon]) => (
              <a key={href} href={href} target="_blank" rel="noreferrer"
                style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                         color: 'rgba(255,255,255,0.7)', display: 'inline-flex',
                         transition: 'background var(--duration-fast) var(--ease-out)' }}
                onMouseEnter={e => iconHover(e, true)}
                onMouseLeave={e => iconHover(e, false)}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(c => (
          <div key={c.title}>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 13,
                         letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              {c.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {c.items.map(([to, label]) => (
                <li key={label}>
                  <a href={to} style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                                        transition: 'color var(--duration-fast) var(--ease-out)' }}
                    onMouseEnter={e => linkHover(e, true)}
                    onMouseLeave={e => linkHover(e, false)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1120, margin: '32px auto 0', paddingTop: 18,
                    borderTop: '1px solid rgba(255,255,255,0.14)',
                    display: 'flex', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 8, fontSize: 13 }}
           className="ps-section">
        <span>© {new Date().getFullYear()} Playa &amp; Sol Piscinas</span>
        <span style={{ opacity: 0.6 }}>Aviso legal · Privacidad · Cookies</span>
      </div>
    </footer>
  );
}
