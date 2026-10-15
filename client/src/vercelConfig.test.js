import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// El vercel.json efectivo es el de la raíz: el deploy corre `npm run build:vercel`
// desde ahí, publica `client/dist` y mapea `/api/*` a `api/index.js` (que vive en la
// raíz del repo). Este test lo lee para que nadie quite los headers sin darse cuenta.
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.resolve(here, '..', 'index.html'), 'utf8');

const allPathsHeaders = () => {
  const block = (vercel.headers || []).find((h) => h.source === '/(.*)');
  const map = {};
  for (const { key, value } of block?.headers || []) map[key.toLowerCase()] = value;
  return map;
};

const directive = (csp, name) =>
  csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d === name || d.startsWith(`${name} `));

describe('vercel.json — headers de seguridad', () => {
  it('define un bloque de headers para todas las rutas', () => {
    expect(allPathsHeaders()).not.toEqual({});
  });

  it('incluye los headers requeridos con el valor esperado', () => {
    const h = allPathsHeaders();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('Permissions-Policy desactiva camera, microphone, geolocation, payment y usb', () => {
    const value = allPathsHeaders()['permissions-policy'];
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(value).toContain(`${feature}=()`);
    }
  });

  it('no define Strict-Transport-Security (lo agrega Vercel)', () => {
    expect(allPathsHeaders()['strict-transport-security']).toBeUndefined();
  });
});

describe('vercel.json — Content-Security-Policy', () => {
  const csp = () => allPathsHeaders()['content-security-policy'];

  it('se aplica (enforcement) y ya no queda ningún Report-Only', () => {
    expect(csp()).toBeTruthy();
    expect(allPathsHeaders()['content-security-policy-report-only']).toBeUndefined();
  });

  it("incluye manifest-src 'self' y worker-src 'self' explícitos", () => {
    expect(directive(csp(), 'manifest-src')).toBe("manifest-src 'self'");
    expect(directive(csp(), 'worker-src')).toBe("worker-src 'self'");
  });

  it("mantiene object-src 'none', base-uri 'self', form-action 'self' y frame-ancestors 'none'", () => {
    expect(directive(csp(), 'object-src')).toBe("object-src 'none'");
    expect(directive(csp(), 'base-uri')).toBe("base-uri 'self'");
    expect(directive(csp(), 'form-action')).toBe("form-action 'self'");
    expect(directive(csp(), 'frame-ancestors')).toBe("frame-ancestors 'none'");
  });

  it('no abre orígenes inseguros: sin comodín global, sin http: ni unsafe-inline/eval en script-src', () => {
    for (const d of csp().split(';').map((x) => x.trim())) {
      expect(d, d).not.toMatch(/(^|\s)\*(\s|$)/);
      expect(d, d).not.toMatch(/\shttp:(\s|$)/);
    }
    const script = directive(csp(), 'script-src');
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
  });

  it('solo hay los orígenes externos que el código usa (GA, Cloudinary, Google Fonts, Google Maps)', () => {
    const origins = new Set(csp().match(/https:\/\/[^\s;]+/g));
    expect([...origins].sort()).toEqual(
      [
        'https://*.analytics.google.com',
        'https://*.google-analytics.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://res.cloudinary.com',
        'https://www.google.com',
        'https://www.googletagmanager.com',
      ].sort()
    );
  });

  it("contiene object-src 'none', base-uri 'self' y frame-ancestors 'none'", () => {
    expect(directive(csp(), 'object-src')).toBe("object-src 'none'");
    expect(directive(csp(), 'base-uri')).toBe("base-uri 'self'");
    expect(directive(csp(), 'frame-ancestors')).toBe("frame-ancestors 'none'");
  });

  it("script-src no admite 'unsafe-inline' ni 'unsafe-eval'", () => {
    const scriptSrc = directive(csp(), 'script-src');
    expect(scriptSrc).toBeTruthy();
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('index.html no tiene scripts inline (la CSP exige script-src self)', () => {
    // Solo cuentan los scripts ejecutables: un bloque de datos (type="application/ld+json")
    // no se ejecuta y no lo restringe script-src.
    const executable = (attrs) => {
      const type = /\btype\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1]?.toLowerCase();
      return !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript';
    };
    const inline = [...indexHtml.matchAll(/<script\b([^>]*)>/gi)].filter(
      (m) => executable(m[1]) && !/\bsrc\s*=/.test(m[1])
    );
    expect(inline).toHaveLength(0);
  });
});

describe('vercel.json — rewrites', () => {
  it('manda /api/* a la función y el resto al index.html de la SPA', () => {
    const { rewrites } = vercel;
    expect(rewrites).toContainEqual({ source: '/api/(.*)', destination: '/api/index.js' });
    const apiIdx = rewrites.findIndex((r) => r.source === '/api/(.*)');
    const spaIdx = rewrites.findIndex((r) => r.source === '/(.*)');
    expect(spaIdx).toBeGreaterThan(apiIdx);
    expect(rewrites[spaIdx].destination).toBe('/index.html');
  });
});
