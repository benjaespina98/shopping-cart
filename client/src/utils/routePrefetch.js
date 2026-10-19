import { cldOptimized, cldSrcSet, isCloudinary } from './cloudinary';
import { productsAPI, projectsAPI, servicesAPI } from '../services/api';
import { SERVICE_PHOTO, PROJECT_PHOTO, ABOUT_PHOTO, CONTACT_PHOTO, PRODUCT_CARD_PHOTO } from './imageSpecs';

// Por qué existe: al navegar a Servicios, Proyectos o Tienda el visitante esperaba una cascada
// completa — bajar el chunk de la página, recién ahí pedir los datos, y recién al renderizarlos pedir
// las fotos (que además Cloudinary genera la primera vez que se pide cada ancho). Acá se adelanta
// cada eslabón: el chunk, los datos y las primeras fotos se piden cuando hay señal de que la página va
// a abrirse (pasar el mouse, foco, toque) o, en baja prioridad, cuando la home ya terminó de cargar.
// Todo es opcional: si algo falla, la página pide lo suyo como siempre.

const DATA_TTL_MS = 60_000; // igual que el s-maxage de la API: no se muestra nada más viejo que el borde

const cache = new Map();

// Devuelve la promesa en vuelo (o ya resuelta) si hay una vigente; si no, la crea.
export function prefetchData(key, loader) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < DATA_TTL_MS) return entry.promise;
  let promise;
  try { promise = Promise.resolve(loader()); } catch (err) { promise = Promise.reject(err); }
  cache.set(key, { promise, at: Date.now() });
  promise.catch(() => { if (cache.get(key)?.promise === promise) cache.delete(key); });
  return promise;
}

// Para las páginas: la promesa vigente o null (y entonces piden los datos ellas, como siempre).
export function takePrefetched(key) {
  const entry = cache.get(key);
  return entry && Date.now() - entry.at < DATA_TTL_MS ? entry.promise : null;
}

export function clearPrefetchCache() { cache.clear(); }

// Sin ahorro de datos ni conexiones 2G: no se gasta ancho de banda por adelantado.
function shouldSkip() {
  const connection = typeof navigator !== 'undefined' ? navigator.connection : null;
  return !!connection && (connection.saveData === true || /2g$/.test(connection.effectiveType || ''));
}

// Pide la misma variante que va a pintar <CldImage>/<Photo> (mismo srcset y sizes), en baja prioridad,
// sin tocar el DOM: queda en la caché HTTP del navegador.
export function warmImage(url, spec) {
  if (typeof Image === 'undefined' || !isCloudinary(url)) return;
  const img = new Image();
  img.decoding = 'async';
  img.fetchPriority = 'low';
  img.sizes = spec.sizes;
  img.srcset = cldSrcSet(url, spec.widths);
  img.src = cldOptimized(url, spec.width);
}

const firstUrls = (items, pick, count) => items.map(pick).filter(Boolean).slice(0, count);

const loadServices = () => prefetchData('services', () => servicesAPI.getAll());
const loadProjects = () => prefetchData('projects', () => projectsAPI.getAll());
// Mismos parámetros que la primera carga de Tienda (sin filtros, página 1): ver Shop.jsx.
const loadProducts = () => prefetchData('products', () => productsAPI.getAll({ page: 1, limit: 12 }));

// ruta -> chunk (mismo import que App.jsx: Vite lo resuelve al mismo archivo) + datos + fotos de arriba.
// `photos` recibe cuántas fotos calentar: pocas en idle, más con intención.
const ROUTES = {
  '/servicios': {
    chunk: () => import('../pages/Services'),
    run: (count) => loadServices().then(({ data }) =>
      firstUrls(data || [], (s) => s.imageUrl, count).forEach((u) => warmImage(u, SERVICE_PHOTO))),
  },
  '/proyectos': {
    chunk: () => import('../pages/Projects'),
    run: (count) => loadProjects().then(({ data }) =>
      firstUrls(data || [], (p) => p.imageUrl, count).forEach((u) => warmImage(u, PROJECT_PHOTO))),
  },
  '/tienda': {
    chunk: () => import('../pages/Shop'),
    run: (count) => loadProducts().then(({ data }) =>
      firstUrls(data?.products || [], (p) => p.images?.[0]?.url, count).forEach((u) => warmImage(u, PRODUCT_CARD_PHOTO))),
  },
  '/nosotros': { chunk: () => import('../pages/About') },
  '/contacto': { chunk: () => import('../pages/Contact') },
  '/presupuesto': { chunk: () => import('../pages/Quote') },
};

const done = new Set();

// Último `settings` conocido (lo informa RouteWarmup): trae las fotos de Nosotros y Contacto.
let latestSettings = null;
export function rememberSettings(settings) { latestSettings = settings; }

// Con intención del visitante (hover, foco, toque): chunk + datos + primeras fotos de esa página.
export function prefetchRoute(path, settings = latestSettings) {
  const route = ROUTES[path];
  if (!route || shouldSkip()) return;
  route.chunk?.().catch(() => {});
  route.run?.(4).catch(() => {});
  warmSettingsPhoto(path, settings);
}

function warmSettingsPhoto(path, settings) {
  if (path === '/nosotros' && settings?.aboutPhotoUrl) warmImage(settings.aboutPhotoUrl, ABOUT_PHOTO);
  if (path === '/contacto' && settings?.contactPhotoUrl) warmImage(settings.contactPhotoUrl, CONTACT_PHOTO);
}

// En idle, tras la carga de la home: chunks y datos de todas las secciones principales y solo la primera foto
// de cada una (un par de KB de JS y unas decenas de KB de imagen, en baja prioridad). Se ejecuta una vez.
export function warmPublicRoutes(settings = latestSettings) {
  if (shouldSkip()) return;
  Object.keys(ROUTES).forEach((path) => {
    if (done.has(path)) return;
    done.add(path);
    const route = ROUTES[path];
    route.chunk?.().catch(() => {});
    route.run?.(1).catch(() => {});
    warmSettingsPhoto(path, settings);
  });
}
