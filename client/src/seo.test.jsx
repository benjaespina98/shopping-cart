import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePageMeta from './hooks/usePageMeta';
import NotFound from './pages/NotFound';
import { PAGE_META, SITE_URL, resolveMeta } from './seo/pageMeta';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(here, '..');
const read = (...p) => fs.readFileSync(path.join(clientRoot, ...p), 'utf8');

const indexHtml = read('index.html');
const appSource = read('src', 'App.jsx');

// Rutas públicas reales: las <Route path="/..."> cuyo element es una página con
// <Suspense fallback={<PublicFallback />}>. Excluye redirecciones (<Navigate>) y el comodín.
const publicRoutesFromApp = () =>
  [...appSource.matchAll(/<Route path="(\/[^"]*)" element=\{<Suspense fallback=\{<PublicFallback \/>\}>/g)].map(
    (m) => m[1]
  );

describe('rutas públicas en App.jsx', () => {
  it('se detectan las rutas públicas esperadas', () => {
    expect(publicRoutesFromApp().sort()).toEqual(
      ['/', '/contacto', '/nosotros', '/presupuesto', '/proyectos', '/servicios', '/tienda'].sort()
    );
  });
});

describe('robots.txt', () => {
  const robots = read('public', 'robots.txt');

  it('permite todo, bloquea /admin y apunta al sitemap con URL absoluta', () => {
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toMatch(/^Disallow: \/admin$/m);
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});

describe('sitemap.xml', () => {
  const xml = read('public', 'sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it('tiene URLs absolutas', () => {
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) expect(loc.startsWith(`${SITE_URL}/`) || loc === SITE_URL).toBe(true);
  });

  it('coincide exactamente con las rutas públicas de App.jsx', () => {
    const fromApp = publicRoutesFromApp().map((r) => (r === '/' ? `${SITE_URL}/` : `${SITE_URL}${r}`));
    expect([...locs].sort()).toEqual([...fromApp].sort());
  });

  it('no incluye /admin ni redirecciones', () => {
    for (const loc of locs) {
      expect(loc).not.toContain('/admin');
      expect(loc).not.toContain('/ubicacion');
    }
  });

  it('PAGE_META cubre las mismas rutas', () => {
    expect(Object.keys(PAGE_META).sort()).toEqual([...publicRoutesFromApp()].sort());
  });
});

describe('site.webmanifest', () => {
  const manifest = JSON.parse(read('public', 'site.webmanifest'));

  it('parsea y tiene los campos básicos', () => {
    expect(manifest.name).toBe('Playa & Sol Piscinas');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('los colores salen de los tokens de marca', () => {
    const tokens = read('src', 'design-system', 'tokens.css').toUpperCase();
    expect(tokens).toContain(manifest.theme_color.toUpperCase());
    expect(tokens).toContain(manifest.background_color.toUpperCase());
  });

  it('solo referencia íconos que existen en public/', () => {
    for (const icon of manifest.icons) {
      expect(fs.existsSync(path.join(clientRoot, 'public', icon.src.replace(/^\//, ''))), icon.src).toBe(true);
    }
  });
});

describe('index.html', () => {
  it('declara canonical, og:url, theme-color y manifest absolutos/consistentes', () => {
    expect(indexHtml).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
    expect(indexHtml).toContain(`<meta property="og:url" content="${SITE_URL}/" />`);
    expect(indexHtml).toMatch(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}" \/>/);
    expect(indexHtml).toContain('<link rel="manifest" href="/site.webmanifest" />');
  });

  it('el JSON-LD parsea y es un LocalBusiness con datos del sitio', () => {
    const match = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const data = JSON.parse(match[1]);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.name).toBe('Playa & Sol Piscinas');
    expect(data.url).toBe(`${SITE_URL}/`);
    expect(data.address.addressLocality).toBe('Villa María');
    expect(data.address.addressCountry).toBe('AR');
    // Lo que NO existe en el código no se inventa.
    for (const forbidden of ['aggregateRating', 'review', 'priceRange', 'openingHoursSpecification']) {
      expect(data).not.toHaveProperty(forbidden);
    }
  });

  it('el teléfono y el email del JSON-LD coinciden con los datos públicos del código', () => {
    const data = JSON.parse(indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const settings = read('src', 'context', 'SettingsContext.jsx');
    expect(settings).toContain(`tel:${data.telephone}`);
    expect(settings).toContain(data.email);
  });

  it('los enlaces sameAs existen en el código del sitio', () => {
    const data = JSON.parse(indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const contact = read('src', 'pages', 'Contact.jsx');
    for (const url of data.sameAs) expect(contact, url).toContain(url);
  });
});

function MetaProbe() {
  usePageMeta();
  return null;
}

const renderAt = (pathname) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <MetaProbe />
    </MemoryRouter>
  );

const metaContent = (selector) => document.head.querySelector(selector)?.getAttribute('content');

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it.each(Object.keys(PAGE_META))('%s: título, description, canonical y og:url propios, indexable', (route) => {
    renderAt(route);
    const expectedUrl = `${SITE_URL}${route}`;

    expect(document.title).toBe(PAGE_META[route].title);
    expect(metaContent('meta[name="description"]')).toBe(PAGE_META[route].description);
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(expectedUrl);
    expect(metaContent('meta[property="og:url"]')).toBe(expectedUrl);
    expect(metaContent('meta[name="robots"]')).toBe('index, follow');
  });

  it('los títulos y descripciones públicos son únicos', () => {
    const titles = Object.values(PAGE_META).map((m) => m.title);
    const descriptions = Object.values(PAGE_META).map((m) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('rutas /admin: noindex, nofollow y sin canonical', () => {
    document.head.innerHTML = '<link rel="canonical" href="https://playaysol.vercel.app/" />';
    renderAt('/admin/dashboard');
    expect(metaContent('meta[name="robots"]')).toBe('noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('ruta inexistente: noindex y título de página no encontrada', () => {
    renderAt('/no-existe');
    expect(metaContent('meta[name="robots"]')).toMatch(/noindex/);
    expect(document.title).toMatch(/no encontrada/i);
  });

  it('tolera la barra final (/tienda/)', () => {
    expect(resolveMeta('/tienda/').robots).toBe('index, follow');
  });
});

describe('NotFound', () => {
  it('muestra el aviso y un enlace a la home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /página no encontrada/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });
});
