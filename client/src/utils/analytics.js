const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

// Carga gtag.js solo si hay un Measurement ID configurado — sin variable, no se inyecta
// ningún script de terceros (nada de tracking accidental en desarrollo o sin consentimiento de uso).
export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  // send_page_view en false: las vistas se envían a mano en cada cambio de ruta (trackPageview),
  // necesario porque es una SPA y gtag por defecto solo registra la carga inicial.
  gtag('config', MEASUREMENT_ID, { send_page_view: false });
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
