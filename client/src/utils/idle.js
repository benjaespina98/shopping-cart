// Ayudas para sacar trabajo del camino crítico: ejecutar después del evento load y cuando el hilo
// principal está libre. Sin requestIdleCallback (Safari) se usa un setTimeout de respaldo.
const IDLE_TIMEOUT_MS = 5000;
const FALLBACK_DELAY_MS = 3000;

export function afterWindowLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
    return;
  }
  window.addEventListener('load', callback, { once: true });
}

export function whenIdle(callback, { timeout = IDLE_TIMEOUT_MS, fallbackDelay = FALLBACK_DELAY_MS } = {}) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, fallbackDelay);
  }
}

export const afterLoadAndIdle = (callback, options) => afterWindowLoad(() => whenIdle(callback, options));
