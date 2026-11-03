import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderRouteHtml, routeHtmlPaths } from './routeHtml';
import { PAGE_META, SITE_URL } from './pageMeta';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(here, '..', '..', 'index.html'), 'utf8');

const attr = (html, selector) => html.match(selector)?.[1];

describe('renderRouteHtml', () => {
  it('genera una página por cada ruta pública excepto la home', () => {
    expect(routeHtmlPaths().sort()).toEqual(Object.keys(PAGE_META).filter((r) => r !== '/').sort());
  });

  it.each(routeHtmlPaths())('%s: título, description, canonical y og:* propios', (route) => {
    const html = renderRouteHtml(indexHtml, route);
    const meta = PAGE_META[route];
    const esc = (s) => s.replace(/&/g, '&amp;');

    expect(html).toContain(`<title>${esc(meta.title)}</title>`);
    expect(attr(html, /<meta name="description" content="([^"]*)"/)).toBe(esc(meta.description));
    expect(attr(html, /<link rel="canonical" href="([^"]*)"/)).toBe(`${SITE_URL}${route}`);
    expect(attr(html, /<meta property="og:url" content="([^"]*)"/)).toBe(`${SITE_URL}${route}`);
    expect(attr(html, /<meta property="og:title" content="([^"]*)"/)).toBe(esc(meta.title));
    expect(attr(html, /<meta name="twitter:title" content="([^"]*)"/)).toBe(esc(meta.title));
  });

  it('el <noscript> de cada ruta lleva su propio título y descripción', () => {
    const html = renderRouteHtml(indexHtml, '/servicios');
    const noscript = html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
    expect(noscript).toContain('<h1>Servicios de piscinas | Playa &amp; Sol Piscinas</h1>');
    expect(noscript).toContain('Corrientes 1210');
  });

  it('conserva todo lo demás: JSON-LD, imagen social y el script del bundle', () => {
    const html = renderRouteHtml(indexHtml, '/servicios');
    expect(html).toContain('"@type": "LocalBusiness"');
    expect(html).toContain('og-image.png');
    expect(html).toContain('<script type="module" src="/src/main.jsx"></script>');
  });

  it('rutas sin metadatos fallan en vez de publicar las de otra página', () => {
    expect(() => renderRouteHtml(indexHtml, '/no-existe')).toThrow(/sin metadatos/);
  });

  it('el HTML de la home y las metas de PAGE_META["/"] coinciden', () => {
    expect(indexHtml).toContain(`<title>${PAGE_META['/'].title.replace(/&/g, '&amp;')}</title>`);
    expect(attr(indexHtml, /<meta name="description" content="([^"]*)"/)).toBe(PAGE_META['/'].description.replace(/&/g, '&amp;'));
  });
});
