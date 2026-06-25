import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/playaysol.piscinas/', Icon: FiInstagram, label: 'Instagram', bg: 'linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)' },
  { href: 'https://www.facebook.com/playaysol.piscinas', Icon: FiFacebook, label: 'Facebook', bg: '#1877F2' },
  { href: 'https://wa.me/5493534224605', Icon: FaWhatsapp, label: 'WhatsApp', bg: '#25D366' },
];

const cols = [
  { title: 'Servicios', items: [['/servicios', 'Piscinas de obra'], ['/servicios', 'Reformas'], ['/servicios', 'Climatización'], ['/servicios', 'Cercos y seguridad']] },
  { title: 'Empresa',   items: [['/proyectos', 'Proyectos'], ['/servicios', 'Servicios'], ['/tienda', 'Tienda'], ['/admin/login', 'Portal admin']] },
  { title: 'Contacto',  items: [['tel:+543534224605', '353 422-4605'], ['https://wa.me/5493534224605', 'WhatsApp'], ['mailto:piscinas@playaysol.com.ar', 'piscinas@playaysol.com.ar'], ['#', 'Villa María, Córdoba']] },
];

const linkHover = (e, on) => { e.currentTarget.style.color = on ? '#fff' : 'rgba(255,255,255,0.7)'; };
const socialHover = (e, on) => {
  e.currentTarget.style.transform = on ? 'translateY(-3px) scale(1.06)' : 'translateY(0) scale(1)';
  e.currentTarget.style.boxShadow = on ? '0 8px 18px rgba(0,0,0,0.28)' : '0 2px 6px rgba(0,0,0,0.18)';
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-800)', color: 'rgba(255,255,255,0.78)', padding: '48px 40px 28px', fontFamily: 'var(--font-body)' }}
            className="ps-section">
      <div className="ps-footer-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, whiteSpace: 'nowrap' }}>
            <svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="50" cy="33" r="19" fill="none" stroke="#FFC629" strokeWidth="7"/>
              <path d="M10 64 Q20 57 30 64 Q40 71 50 64 Q60 57 70 64 Q80 71 90 64" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" fill="none"/>
              <line x1="10" y1="80" x2="90" y2="80" stroke="#ffffff" strokeWidth="7" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Playa</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--sun-400)' }}>&amp; Sol</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240, marginBottom: 18 }}>
            Diseño, construcción y mantenimiento de piscinas en Villa María y la región desde 2004.
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            Seguinos
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {SOCIAL_LINKS.map(({ href, Icon, label, bg }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                style={{ width: 42, height: 42, borderRadius: 12, background: bg,
                         color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                         boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                         transition: 'transform 180ms ease, box-shadow 180ms ease' }}
                onMouseEnter={e => socialHover(e, true)}
                onMouseLeave={e => socialHover(e, false)}>
                <Icon size={20} />
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
