import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/playaysol.piscinas/', Icon: FiInstagram, label: 'Instagram', bg: 'linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)' },
  { href: 'https://www.facebook.com/playaysol.piscinas', Icon: FiFacebook, label: 'Facebook', bg: '#1877F2' },
  { href: 'https://wa.me/5493534224607', Icon: FaWhatsapp, label: 'WhatsApp', bg: '#25D366' },
];

const cols = [
  { title: 'Servicios', items: [['/servicios', 'Piscinas de obra'], ['/servicios', 'Reformas'], ['/servicios', 'Climatización'], ['/servicios', 'Cercos y seguridad']] },
  { title: 'Empresa',   items: [['/nosotros', 'Nosotros'], ['/proyectos', 'Proyectos'], ['/tienda', 'Tienda'], ['/admin/login', 'Portal admin']] },
  { title: 'Contacto',  items: [['/contacto', 'Escribinos'], ['tel:+543534224607', '353 422-4607'], ['https://wa.me/5493534224607', 'WhatsApp'], ['mailto:piscinas@playaysol.com.ar', 'piscinas@playaysol.com.ar']] },
];

const linkHover = (e, on) => { e.currentTarget.style.color = on ? 'var(--text-inverse)' : 'var(--text-inverse-muted)'; };
const socialHover = (e, on) => {
  e.currentTarget.style.transform = on ? 'translateY(-3px) scale(1.06)' : 'translateY(0) scale(1)';
  e.currentTarget.style.boxShadow = on ? 'var(--shadow-lg)' : 'var(--shadow-sm)';
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-800)', color: 'var(--text-inverse-muted)', padding: '48px 40px 28px', fontFamily: 'var(--font-body)' }}
            className="ps-section">
      <div className="ps-footer-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <img src="/brand/logo-horizontal.png" alt="Playa & Sol" style={{ height: 30, width: 'auto', display: 'block' }} />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240, marginBottom: 18 }}>
            Diseño, construcción y mantenimiento de piscinas en Villa María y la región, con más de 30 años de trayectoria.
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--text-inverse-faint)', marginBottom: 10 }}>
            Seguinos
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {SOCIAL_LINKS.map(({ href, Icon, label, bg }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                style={{ width: 42, height: 42, borderRadius: 12, background: bg,
                         color: 'var(--text-inverse)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                         boxShadow: 'var(--shadow-sm)',
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
            <h4 style={{ color: 'var(--text-inverse)', fontFamily: 'var(--font-display)', fontSize: 13,
                         letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              {c.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {c.items.map(([to, label]) => (
                <li key={label}>
                  <a href={to} style={{ fontSize: 14, color: 'var(--text-inverse-muted)', textDecoration: 'none',
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
                    borderTop: '1px solid var(--border-on-dark-subtle)',
                    display: 'flex', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 8, fontSize: 13 }}
           className="ps-section">
        <span>© {new Date().getFullYear()} Playa &amp; Sol Piscinas</span>
        <span style={{ opacity: 0.6 }}>Aviso legal · Privacidad · Cookies</span>
      </div>
    </footer>
  );
}
