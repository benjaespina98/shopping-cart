import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cldOptimized, cldSrcSet } from './cloudinary';

// public/prefetch.js precarga la foto del hero. Tiene que pedir lo mismo que pinta <Photo> en
// Landing.jsx (mismo srcset y sizes): si no, el navegador la descarga dos veces.
const here = path.dirname(fileURLToPath(import.meta.url));
const prefetchSource = fs.readFileSync(path.resolve(here, '../../public/prefetch.js'), 'utf8');
const landingSource = fs.readFileSync(path.resolve(here, '../pages/Landing.jsx'), 'utf8');

const HERO = 'https://res.cloudinary.com/demo/image/upload/v1/shopping-cart/projects/hero.jpg';

const run = async (projects) => {
  document.head.innerHTML = '';
  globalThis.fetch = window.fetch = (url) => Promise.resolve({ json: () => Promise.resolve(String(url).includes('projects') ? projects : {}) });
  new Function(prefetchSource)();
  await window.__prefetch.projects;
  await new Promise((r) => setTimeout(r, 0));
  return document.head.querySelector('link[rel="preload"][as="image"]');
};

describe('precarga del hero (public/prefetch.js)', () => {
  beforeEach(() => { delete window.__prefetch; });

  it('pide lo mismo que Landing.jsx: srcset, sizes y src de respaldo', async () => {
    const link = await run([{ _id: 'a', featured: true, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/otra.jpg' }, { _id: 'b', isHero: true, imageUrl: HERO }]);

    const sizes = landingSource.match(/sizes="(\(max-width: 767px\)[^"]+)"/)[1];
    const widths = JSON.parse(landingSource.match(/srcSetWidths=\{(\[[\d, ]+\])\}/)[1]);
    // el hero de Landing es el primer <Photo> con `priority`
    expect(landingSource).toContain('priority');

    expect(link).not.toBeNull();
    expect(link.getAttribute('imagesizes')).toBe(sizes);
    expect(link.getAttribute('imagesrcset')).toBe(cldSrcSet(HERO, widths));
    expect(link.getAttribute('href')).toBe(cldOptimized(HERO, 1200));
    expect(link.getAttribute('fetchpriority')).toBe('high');
  });

  it('sin hero marcado usa el primer proyecto destacado, igual que Landing', async () => {
    const link = await run([{ _id: 'a', featured: true, imageUrl: HERO }]);
    expect(link.getAttribute('href')).toBe(cldOptimized(HERO, 1200));
  });

  it('no precarga imágenes que no sean de res.cloudinary.com ni respuestas inválidas', async () => {
    expect(await run([{ isHero: true, imageUrl: 'https://placehold.co/800x600.png' }])).toBeNull();
    expect(await run([{ isHero: true, imageUrl: 'https://res.cloudinary.com/demo/raw/x.jpg' }])).toBeNull();
    expect(await run(null)).toBeNull();
    expect(await run([{ title: 'sin foto' }])).toBeNull();
  });
});
