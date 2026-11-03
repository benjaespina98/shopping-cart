// Metadatos por ruta pública. Es la fuente única para el hook usePageMeta y para el test que
// compara con el sitemap y con App.jsx. Los textos salen del copy que ya existe en cada página.
export const SITE_URL = 'https://playaysol.vercel.app';
export const SITE_NAME = 'Playa & Sol Piscinas';

export const PAGE_META = {
  '/': {
    title: 'Playa & Sol Piscinas | Piscinas en Villa María, Córdoba',
    description: 'Piscinas de hormigón y de fibra INDUPLAST, revestimientos, cercos, cobertores, climatización y accesorios. Más de 30 años en Villa María, Córdoba.',
  },
  '/tienda': {
    title: 'Tienda | Playa & Sol Piscinas',
    description: 'Todo para tu piscina: productos de mantenimiento y accesorios. Armá tu pedido y finalizalo por WhatsApp.',
  },
  '/servicios': {
    title: 'Servicios de piscinas | Playa & Sol Piscinas',
    description: 'Piscinas de hormigón y de fibra INDUPLAST, revestimientos, cercos, cobertores y climatización en Villa María, Córdoba. Pedí tu presupuesto sin compromiso.',
  },
  '/proyectos': {
    title: 'Obras y proyectos de piscinas | Playa & Sol Piscinas',
    description: 'Obras terminadas de Playa & Sol: piscinas que construimos y reformamos en Villa María, Córdoba, y la región.',
  },
  '/nosotros': {
    title: 'Nosotros | Playa & Sol Piscinas',
    description: 'Construimos piscinas en Villa María, Córdoba, desde hace más de 30 años. Conocé cómo trabajamos.',
  },
  '/presupuesto': {
    title: 'Pedí tu presupuesto de piscina | Playa & Sol Piscinas',
    description: 'Contanos tu proyecto y recibí tu presupuesto sin compromiso. Nos contactamos con vos dentro de 48 horas.',
  },
  '/contacto': {
    title: 'Contacto y showroom | Playa & Sol Piscinas',
    description: 'Escribinos por WhatsApp, teléfono o email, o visitanos en Corrientes 1210, Villa María, Córdoba.',
  },
};

export const NOT_FOUND_META = {
  title: 'Página no encontrada | Playa & Sol Piscinas',
  description: 'La página que buscás no existe.',
};

export const ADMIN_META = {
  title: 'Panel de administración | Playa & Sol Piscinas',
  description: 'Panel de administración.',
};

export const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

// Normaliza "/tienda/" → "/tienda" (la home queda "/").
export const normalizePath = (pathname) => {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
};

export const resolveMeta = (pathname) => {
  const path = normalizePath(pathname);
  if (isAdminPath(path)) return { ...ADMIN_META, robots: 'noindex, nofollow', canonical: null };
  const known = PAGE_META[path];
  if (known) return { ...known, robots: 'index, follow', canonical: `${SITE_URL}${path === '/' ? '/' : path}` };
  return { ...NOT_FOUND_META, robots: 'noindex, follow', canonical: null };
};
