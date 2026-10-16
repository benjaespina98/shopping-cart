import { afterLoadAndIdle } from './idle';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

// gtag.js pesa ~100 KB y ejecuta bastante JavaScript: no puede competir con el render inicial ni
// entrar en el camino crítico (LCP, TBT). Se carga después de load y en idle (utils/idle.js).

function loadGtagScript() {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

// Prepara gtag al instante (es solo un array y una función, sin red) para no perder los eventos
// que ocurran antes de que cargue el script: quedan en dataLayer y gtag.js los procesa al llegar.
// Lo único que se difiere es la descarga de gtag.js.
// Sin MEASUREMENT_ID no se inyecta ningún script de terceros.
export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  // send_page_view en false: las vistas se envían a mano en cada cambio de ruta (trackPageview),
  // necesario porque es una SPA y gtag por defecto solo registra la carga inicial.
  gtag('config', MEASUREMENT_ID, { send_page_view: false });

  afterLoadAndIdle(loadGtagScript);
}

export function trackPageview(path) {
  if (!MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
