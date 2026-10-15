import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveMeta } from '../seo/pageMeta';

// Actualiza título, description, canonical, og:* y robots según la ruta. Sin dependencias.
// Los rastreadores que ejecutan JavaScript (Google) ven estos valores; los scrapers de redes
// sociales solo leen el index.html estático, que lleva los de la home.
const upsert = (selector, create, set) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  set(el);
};

const setMeta = (attr, key, content) =>
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(attr, key);
      return el;
    },
    (el) => el.setAttribute('content', content)
  );

export default function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveMeta(pathname);

    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', meta.robots);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('name', 'twitter:title', meta.title);

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (meta.canonical) {
      upsert(
        'link[rel="canonical"]',
        () => {
          const el = document.createElement('link');
          el.setAttribute('rel', 'canonical');
          return el;
        },
        (el) => el.setAttribute('href', meta.canonical)
      );
      setMeta('property', 'og:url', meta.canonical);
    } else if (canonical) {
      // Rutas sin canonical propio (admin, 404): no se deja el de la página anterior.
      canonical.remove();
    }
  }, [pathname]);
}
