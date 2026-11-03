import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { servicesAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { FALLBACK_SERVICE_NAMES } from '../../data/fallbackServices';
import { prefetchRoute } from '../../utils/routePrefetch';
import { whatsappUrl } from '../../utils/whatsapp';

const empresaLinks = [
  ['/nosotros', 'Nosotros'],
  ['/proyectos', 'Proyectos'],
  ['/servicios', 'Servicios'],
  ['/tienda', 'Tienda'],
];

const linkStyle = {
  fontSize: 14, color: 'var(--text-inverse-muted)', textDecoration: 'none',
  transition: 'color var(--duration-fast) var(--ease-out)',
};
const linkHover = (e, on) => { e.currentTarget.style.color = on ? 'var(--text-inverse)' : 'var(--text-inverse-muted)'; };

// Las rutas internas se navegan con <Link>; teléfonos, mails y redes con <a>.
// Todo el footer usaba <a href="/...">, así que cada click recargaba la aplicación
// entera: se perdía el carrito en memoria y volvían a descargarse todos los bundles.
function FooterLink({ to, label }) {
  const handlers = {
    onMouseEnter: (e) => { linkHover(e, true); prefetchRoute(to); },
    onMouseLeave: (e) => linkHover(e, false),
    onFocus: () => prefetchRoute(to),
  };

  return to.startsWith('/')
    ? <Link to={to} style={linkStyle} {...handlers}>{label}</Link>
    : <a href={to} {...(to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={linkStyle} {...handlers}>{label}</a>;
}

export default function Footer() {
  const { settings } = useSettings();
  const [serviceNames, setServiceNames] = useState(FALLBACK_SERVICE_NAMES);

  useEffect(() => {
    // Mismos servicios que administrás en /admin/servicios — así el footer
    // nunca queda desactualizado respecto a lo que realmente se ofrece.
    servicesAPI.getAll()
      .then(({ data }) => {
        if (data?.length > 0) setServiceNames(data.slice(0, 8).map((s) => s.title));
      })
      .catch(() => {});
  }, []);

  // Íconos de un solo tono: los colores de cada red (degradado de Instagram, azul, negro, verde) competían
  // con la paleta de la marca y eran lo más llamativo del pie.
  const socialLinks = [
    { href: 'https://www.instagram.com/playaysol.piscinas/', Icon: FiInstagram, label: 'Instagram' },
    { href: 'https://www.facebook.com/playaysol.piscinas', Icon: FiFacebook, label: 'Facebook' },
    { href: 'https://www.tiktok.com/@playaysolpiscinas', Icon: FaTiktok, label: 'TikTok' },
    { href: whatsappUrl(settings.whatsappNumber), Icon: FaWhatsapp, label: 'WhatsApp' },
  ];

  const cols = [
    { title: 'Servicios', items: serviceNames.map((name) => ['/servicios', name]) },
    { title: 'Empresa',   items: empresaLinks },
    { title: 'Contacto',  items: [
      ['/contacto', 'Escribinos'],
      [settings.phoneNumberLink, settings.phoneNumberDisplay],
      [whatsappUrl(settings.whatsappNumber), 'WhatsApp'],
      [`mailto:${settings.contactEmail}`, settings.contactEmail],
    ] },
  ];

  return (
    <footer style={{ background: 'var(--teal-800)', color: 'var(--text-inverse-muted)', padding: '48px 40px 28px', fontFamily: 'var(--font-body)' }}
            className="ps-section">
      <div className="ps-footer-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <img src="/brand/logo-horizontal.png" alt="Playa & Sol" width={174} height={30} loading="lazy" decoding="async"
                 className="ps-logo-inverse" style={{ height: 30, width: 'auto', display: 'block' }} />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240, marginBottom: 18 }}>
            Diseño, construcción y mantenimiento de piscinas en Villa María y la región, con más de 30 años de trayectoria.
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--text-inverse-faint)', marginBottom: 10 }}>
            Seguinos
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {socialLinks.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="ps-social-link">
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(c => (
          <div key={c.title}>
            {/* h2 y no h4: antes de este título la página suele terminar en un h2 (o solo tiene h1), y
                saltar a h4 rompía el orden de encabezados. El aspecto no cambia: los h1–h6 comparten
                estilo en index.css y el tamaño va en línea. */}
            <h2 style={{ color: 'var(--text-inverse)', fontFamily: 'var(--font-display)', fontSize: 13,
                         letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              {c.title}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {c.items.map(([to, label]) => (
                <li key={label}><FooterLink to={to} label={label} /></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Antes decía "Aviso legal · Privacidad · Cookies" en texto plano, sin enlaces ni
          páginas detrás. Se reemplaza por un dato real en lugar de una promesa vacía. */}
      <div style={{ maxWidth: 1120, margin: '32px auto 0', paddingTop: 18,
                    borderTop: '1px solid var(--border-on-dark-subtle)',
                    display: 'flex', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 8, fontSize: 13 }}
           className="ps-section">
        <span>© {new Date().getFullYear()} Playa & Sol Piscinas</span>
        <span style={{ color: 'var(--text-inverse-faint)' }}>Corrientes 1210, Villa María, Córdoba</span>
      </div>
    </footer>
  );
}
