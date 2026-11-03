// HTML por ruta para el build. El sitio es una SPA: todas las rutas respondían con el index.html de la
// home, así que WhatsApp, Facebook, X y los rastreadores sin JavaScript veían siempre el título, la
// description y el canonical de la portada. Este módulo parte del index.html ya procesado por Vite y
// devuelve una copia con los metadatos de cada ruta (los mismos de PAGE_META, que usa también
// usePageMeta en el navegador). El plugin `routeHtml` de vite.config.js la emite como
// dist/<ruta>/index.html, que el hosting sirve antes que el rewrite a /index.html (docs/SEO.md).
import { PAGE_META, SITE_URL } from './pageMeta.js';

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Reemplaza una etiqueta que debe existir en el HTML de origen; si no está, falla el build (mejor que
// publicar una ruta con los metadatos de otra).
function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`routeHtml: no encontré ${label} en index.html`);
  return html.replace(pattern, () => replacement);
}

export function renderRouteHtml(html, route) {
  const meta = PAGE_META[route];
  if (!meta) throw new Error(`routeHtml: sin metadatos para ${route}`);
  const url = `${SITE_URL}${route}`;
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);

  let out = html;
  out = replaceTag(out, /<title>[\s\S]*?<\/title>/, `<title>${escapeText(meta.title)}</title>`, '<title>');
  out = replaceTag(out, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`, 'meta description');
  out = replaceTag(out, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical');
  out = replaceTag(out, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`, 'og:url');
  out = replaceTag(out, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`, 'og:title');
  out = replaceTag(out, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`, 'og:description');
  out = replaceTag(out, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title');
  out = replaceTag(out, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description');
  return out;
}

// Rutas que reciben su propio HTML: todas las públicas menos la home (que es el index.html).
export const routeHtmlPaths = () => Object.keys(PAGE_META).filter((route) => route !== '/');
