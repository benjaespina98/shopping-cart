import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

// jsdom no implementa IntersectionObserver y useReveal lo usa en casi todas las
// secciones del sitio: sin este stub cualquier render de una página revienta.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
globalThis.IntersectionObserver = IntersectionObserverStub;

// Tampoco implementa matchMedia (lo consultan algunos componentes vía Tailwind/JS).
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });
}
