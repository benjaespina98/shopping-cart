import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Photo } from '../design-system/Photo';
import { SERVICE_PHOTO, PROJECT_PHOTO, PRODUCT_CARD_PHOTO } from './imageSpecs';
import {
  prefetchData, takePrefetched, clearPrefetchCache, warmImage, prefetchRoute, warmPublicRoutes, rememberSettings,
} from './routePrefetch';
import { servicesAPI, projectsAPI, productsAPI } from '../services/api';

vi.mock('../services/api', () => ({
  servicesAPI: { getAll: vi.fn() },
  projectsAPI: { getAll: vi.fn() },
  productsAPI: { getAll: vi.fn() },
}));
vi.mock('../pages/Services', () => ({ default: () => null }));
vi.mock('../pages/Projects', () => ({ default: () => null }));
vi.mock('../pages/Shop', () => ({ default: () => null }));
vi.mock('../pages/About', () => ({ default: () => null }));
vi.mock('../pages/Contact', () => ({ default: () => null }));
vi.mock('../pages/Quote', () => ({ default: () => null }));

const CLD = (n) => `https://res.cloudinary.com/demo/image/upload/v1/shopping-cart/${n}.jpg`;

// Registra las imágenes que se "descargan" sin tocar la red.
let warmed;
const RealImage = globalThis.Image;
beforeEach(() => {
  clearPrefetchCache();
  vi.clearAllMocks();
  warmed = [];
  globalThis.Image = class {
    constructor() { warmed.push(this); }
  };
  delete navigator.connection;
});
afterEach(() => { globalThis.Image = RealImage; });

describe('caché de datos precalentados', () => {
  it('reusa la misma promesa dentro del TTL y la descarta cuando falla', async () => {
    const loader = vi.fn(() => Promise.resolve({ data: [1] }));
    const a = prefetchData('x', loader);
    const b = prefetchData('x', loader);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(takePrefetched('x')).toBe(a);

    const falla = prefetchData('y', () => Promise.reject(new Error('red')));
    await falla.catch(() => {});
    await Promise.resolve();
    expect(takePrefetched('y')).toBeNull();
  });

  it('vence pasado un minuto', () => {
    vi.useFakeTimers();
    try {
      prefetchData('z', () => Promise.resolve(1));
      expect(takePrefetched('z')).not.toBeNull();
      vi.advanceTimersByTime(61_000);
      expect(takePrefetched('z')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('warmImage pide lo mismo que pinta la página (si no, se descarga dos veces)', () => {
  it.each([
    ['servicios', SERVICE_PHOTO, {}],
    ['proyectos', PROJECT_PHOTO, {}],
  ])('%s: mismo src, srcset y sizes que <Photo>', (_n, spec) => {
    const url = CLD('foto');
    const { container } = render(<Photo src={url} label="" sizes={spec.sizes} srcSetWidths={spec.widths} height={200} />);
    const real = container.querySelector('img');

    warmImage(url, spec);

    expect(warmed).toHaveLength(1);
    expect(warmed[0].src).toBe(real.getAttribute('src'));
    expect(warmed[0].srcset).toBe(real.getAttribute('srcset'));
    expect(warmed[0].sizes).toBe(real.getAttribute('sizes'));
    expect(warmed[0].fetchPriority).toBe('low');
  });

  it('no hace nada con URLs que no son de Cloudinary', () => {
    warmImage('https://placehold.co/400x400.png', PRODUCT_CARD_PHOTO);
    expect(warmed).toHaveLength(0);
  });
});

describe('prefetchRoute / warmPublicRoutes', () => {
  beforeEach(() => {
    servicesAPI.getAll.mockResolvedValue({ data: [{ imageUrl: CLD('s1') }, { imageUrl: CLD('s2') }, { imageUrl: CLD('s3') }] });
    projectsAPI.getAll.mockResolvedValue({ data: [{ imageUrl: CLD('p1') }] });
    productsAPI.getAll.mockResolvedValue({ data: { products: [{ images: [{ url: CLD('a') }] }, { images: [] }] } });
  });

  it('con intención carga datos y hasta 4 fotos; Tienda pide página 1 con 12 productos', async () => {
    prefetchRoute('/servicios');
    prefetchRoute('/tienda');
    await vi.waitFor(() => expect(warmed.length).toBeGreaterThanOrEqual(4));

    expect(servicesAPI.getAll).toHaveBeenCalledTimes(1);
    expect(productsAPI.getAll).toHaveBeenCalledWith({ page: 1, limit: 12 });
    expect(takePrefetched('services')).not.toBeNull();
    expect(takePrefetched('products')).not.toBeNull();
  });

  it('rutas desconocidas o externas no hacen nada', () => {
    prefetchRoute('/admin');
    prefetchRoute('https://wa.me/123');
    prefetchRoute('tel:+54');
    expect(servicesAPI.getAll).not.toHaveBeenCalled();
    expect(warmed).toHaveLength(0);
  });

  it('con ahorro de datos o 2G no se adelanta nada', () => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
    prefetchRoute('/servicios');
    warmPublicRoutes();
    expect(servicesAPI.getAll).not.toHaveBeenCalled();

    Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '2g' } });
    prefetchRoute('/servicios');
    expect(servicesAPI.getAll).not.toHaveBeenCalled();
  });

  it('en idle calienta una sola foto por sección y las de Nosotros/Contacto, una única vez', async () => {
    rememberSettings({ aboutPhotoUrl: CLD('about'), contactPhotoUrl: CLD('contact') });
    warmPublicRoutes();
    await vi.waitFor(() => expect(warmed.length).toBe(5)); // servicios, proyectos, tienda, nosotros, contacto

    warmPublicRoutes();
    await Promise.resolve();
    expect(servicesAPI.getAll).toHaveBeenCalledTimes(1);
    expect(warmed).toHaveLength(5);
  });
});
