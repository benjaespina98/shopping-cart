import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// MEASUREMENT_ID se lee al importar el módulo: cada caso lo importa de nuevo con el entorno armado.
const loadModule = async (id) => {
  vi.resetModules();
  if (id) vi.stubEnv('VITE_GA_MEASUREMENT_ID', id);
  else vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
  return import('./analytics');
};

const gtagScripts = () => [...document.head.querySelectorAll('script[src*="googletagmanager.com"]')];

describe('analytics — gtag fuera del camino crítico', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = '';
    delete window.dataLayer;
    delete window.gtag;
    delete window.requestIdleCallback;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('sin MEASUREMENT_ID no inyecta ningún script de terceros', async () => {
    const { initAnalytics, trackPageview } = await loadModule('');
    initAnalytics();
    vi.advanceTimersByTime(10000);

    expect(gtagScripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
    expect(() => trackPageview('/')).not.toThrow();
  });

  it('no inyecta gtag.js de forma síncrona: espera a load y a un momento de inactividad', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' });
    const { initAnalytics } = await loadModule('G-TEST123');

    initAnalytics();
    expect(gtagScripts()).toHaveLength(0);

    // todavía no cargó la página: tampoco corre el temporizador de respaldo
    vi.advanceTimersByTime(10000);
    expect(gtagScripts()).toHaveLength(0);

    window.dispatchEvent(new Event('load'));
    expect(gtagScripts()).toHaveLength(0); // aún en espera de idle

    vi.advanceTimersByTime(3000);
    expect(gtagScripts()).toHaveLength(1);
    expect(gtagScripts()[0].src).toContain('G-TEST123');
    expect(gtagScripts()[0].async).toBe(true);

    delete document.readyState;
  });

  it('usa requestIdleCallback cuando existe, con timeout', async () => {
    const idle = vi.fn((cb) => cb());
    window.requestIdleCallback = idle;
    const { initAnalytics } = await loadModule('G-TEST123');

    initAnalytics(); // jsdom: readyState "complete"

    expect(idle).toHaveBeenCalledWith(expect.any(Function), { timeout: 5000 });
    expect(gtagScripts()).toHaveLength(1);
  });

  it('los eventos anteriores a la carga de gtag.js quedan en dataLayer', async () => {
    const { initAnalytics, trackPageview, trackEvent } = await loadModule('G-TEST123');

    initAnalytics();
    trackPageview('/tienda');
    trackEvent('generate_lead', { project_type: 'Piscina nueva' });

    expect(gtagScripts()).toHaveLength(0); // el script todavía no cargó
    const commands = window.dataLayer.map((entry) => entry[0]);
    expect(commands).toEqual(['js', 'config', 'event', 'event']);
    expect(window.dataLayer[2][1]).toBe('page_view');
    expect(window.dataLayer[2][2].page_path).toBe('/tienda');
  });

  it('es idempotente: un segundo initAnalytics no duplica el script', async () => {
    const { initAnalytics } = await loadModule('G-TEST123');
    initAnalytics();
    initAnalytics();
    vi.advanceTimersByTime(3000);

    expect(gtagScripts()).toHaveLength(1);
  });
});
