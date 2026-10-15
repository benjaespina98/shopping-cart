import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Guarda estática del foco visible: lo que hace que el indicador no se pierda por un estilo inline.
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(here, ...p), 'utf8').replace(/\r\n/g, '\n');

const tokens = read('design-system', 'tokens.css');
const focusBlock = tokens.slice(tokens.indexOf(':focus-visible {'));

describe('foco visible', () => {
  it('la regla global dibuja outline y un aro de marca que gana a las sombras inline', () => {
    const rule = focusBlock.slice(0, focusBlock.indexOf('}'));
    expect(rule).toMatch(/outline:\s*3px solid var\(--focus-ring\)/);
    expect(rule).toMatch(/box-shadow:\s*0 0 0 2px var\(--brand-primary\) !important/);
  });

  it('el checkbox dibuja el foco en su caja visible (el input real mide 0x0)', () => {
    expect(tokens).toMatch(/\.ps-checkbox__input:focus-visible \+ \.ps-checkbox__box\s*\{[^}]*outline:/);
    const checkbox = read('design-system', 'Checkbox.jsx');
    expect(checkbox).toContain('ps-checkbox__input');
    expect(checkbox).toContain('ps-checkbox__box');
  });

  it('el buscador y el orden de la tienda ya no anulan el outline', () => {
    const shop = read('pages', 'Shop.jsx');
    expect(shop).not.toMatch(/outline:\s*'none'/);
  });

  it('el textarea del presupuesto ya no anula el outline (solo el destino de foco del "Gracias")', () => {
    const quote = read('pages', 'Quote.jsx');
    const matches = quote.match(/outline:\s*'none'/g) || [];
    expect(matches).toHaveLength(1);
    expect(quote).toMatch(/ref=\{thanksRef\} tabIndex=\{-1\}[\s\S]{0,200}outline: 'none'/);
  });

  it('Button y Card no definen boxShadow inline: viene de clases CSS', () => {
    for (const file of ['Button.jsx', 'Card.jsx']) {
      const src = read('design-system', file);
      expect(src, file).not.toMatch(/boxShadow\s*:/);
      expect(src, file).not.toMatch(/style\.boxShadow/);
    }
    expect(tokens).toMatch(/\.ps-card\s*\{\s*box-shadow:/);
    expect(tokens).toMatch(/\.ps-btn--primary\s*\{\s*box-shadow:/);
  });

  it('los destinos de foco programático (tabindex="-1") no reciben el aro', () => {
    expect(tokens).not.toMatch(/:where\([^)]*\[tabindex\],/);
    expect(tokens).toContain('[tabindex]:not([tabindex="-1"])');
  });
});
