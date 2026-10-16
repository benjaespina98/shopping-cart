import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Los tokens de texto neutro y de estado tienen que dar AA (4,5:1) sobre las superficies donde se
// usan, incluidas las de los temas "elegante" y "moderno". Calcula el ratio desde tokens.css, así un
// cambio de color que lo rompa falla acá y no en una auditoría de Lighthouse.
const here = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(here, 'tokens.css'), 'utf8');

const token = (name) => {
  const m = css.match(new RegExp(String.raw`--${name}:\s*(#[0-9a-fA-F]{6})\b`));
  if (!m) throw new Error(`token --${name} no es un hex literal en tokens.css`);
  return m[1];
};
const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => 0.2126 * lin(channel(hex, 0)) + 0.7152 * lin(channel(hex, 1)) + 0.0722 * lin(channel(hex, 2));
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const superficies = {
  'bg-page (sand-50)': token('sand-50'),
  blanco: '#FFFFFF',
  'surface-sunken (grey-50)': token('grey-50'),
  'grey-100': token('grey-100'),
  'elegante: sunken': '#F4F7F8',
  'moderno: bg-page': '#EEF5F7',
  'moderno: sunken': '#E2EEF1',
};

describe('contraste AA de los tokens de texto', () => {
  it.each(Object.entries(superficies))('--text-muted sobre %s', (_n, bg) => {
    expect(ratio(token('text-muted'), bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(superficies).filter(([n]) => n !== 'grey-100' && n !== 'moderno: sunken'))(
    '--text-faint sobre %s', (_n, bg) => {
      expect(ratio(token('text-faint'), bg)).toBeGreaterThanOrEqual(4.5);
    });

  it('texto de error, aviso y éxito sobre su fondo suave y sobre blanco', () => {
    expect(ratio(token('text-error'), token('red-100'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token('text-error'), '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token('text-warning'), token('amber-100'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token('text-success'), token('green-100'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token('text-success'), '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('--text-inverse-faint (blanco con alfa) sobre el teal institucional', () => {
    const alpha = Number(css.match(/--text-inverse-faint:\s*rgba\(255,\s*255,\s*255,\s*([0-9.]+)\)/)[1]);
    const bg = token('teal-700');
    const mixed = '#' + [0, 1, 2]
      .map((i) => Math.round(255 * alpha + channel(bg, i) * 255 * (1 - alpha)).toString(16).padStart(2, '0'))
      .join('');
    expect(ratio(mixed, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
