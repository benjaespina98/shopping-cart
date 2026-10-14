import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Guarda estática: ningún <button>, <a>, <Button> o <Link> puede tener como único contenido un
// ícono sin nombre accesible (aria-label, aria-labelledby o title). Es una heurística sobre el
// código fuente, no reemplaza una revisión con lector de pantalla.
const srcRoot = path.dirname(fileURLToPath(import.meta.url));

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.jsx') && !entry.name.includes('.test.') ? [full] : [];
  });

const TAGS = ['button', 'a', 'Button', 'Link', 'NavLink'];
const ICON = /<(Fi|Fa|Io|Md|Ri|Bs)[A-Za-z0-9]+\b|<svg\b/;

// Devuelve el texto "visible" aproximado de un fragmento JSX: literales + expresiones que no
// contienen JSX (p. ej. {q.phone}); descarta etiquetas y comentarios.
const visibleText = (inner) => {
  let out = '';
  let i = 0;
  while (i < inner.length) {
    if (inner[i] === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < inner.length && depth > 0) {
        if (inner[j] === '{') depth += 1;
        else if (inner[j] === '}') depth -= 1;
        j += 1;
      }
      const expr = inner.slice(i + 1, j - 1);
      if (/^\s*\/\*[\s\S]*\*\/\s*$/.test(expr)) {
        // comentario JSX
      } else if (expr.includes('<')) {
        out += ' ' + visibleText(expr); // expresión con JSX: se analiza su contenido
      } else {
        out += ' texto '; // {variable}: se asume texto
      }
      i = j;
    } else if (inner[i] === '<') {
      const end = inner.indexOf('>', i);
      i = end < 0 ? inner.length : end + 1;
    } else {
      out += inner[i];
      i += 1;
    }
  }
  return out;
};

const findIconOnlyControls = (src) => {
  const found = [];
  for (const tag of TAGS) {
    const open = new RegExp(`<${tag}(\\s|>)`, 'g');
    let match;
    while ((match = open.exec(src))) {
      let i = match.index + tag.length + 1;
      let depth = 0;
      for (; i < src.length; i += 1) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') depth -= 1;
        else if (src[i] === '>' && depth === 0) break;
      }
      const opening = src.slice(match.index, i + 1);
      const selfClosing = src[i - 1] === '/';
      const end = selfClosing ? i + 1 : src.indexOf(`</${tag}>`, i);
      if (end < 0) continue;
      const inner = selfClosing ? '' : src.slice(i + 1, end);

      const labelled = /aria-label(ledby)?\s*=|\btitle\s*=/.test(opening);
      const hasIcon = ICON.test(inner) || /icon(Left|Right)\s*=/.test(opening);
      const hasText = /[A-Za-zÁ-ú]{2,}/.test(visibleText(inner));
      if (hasIcon && !hasText && !labelled) {
        found.push(src.slice(0, match.index).split('\n').length);
      }
    }
  }
  return found;
};

describe('accesibilidad estática', () => {
  it('el detector encuentra un botón solo-ícono sin etiqueta (control positivo)', () => {
    const bad = `<button onClick={f}>\n  <FiX size={18} />\n</button>`;
    const good = `<button onClick={f} aria-label="Cerrar">\n  <FiX size={18} />\n</button>`;
    const withText = `<a href="x"><FiPhone size={13} /> {q.phone}</a>`;
    expect(findIconOnlyControls(bad)).toHaveLength(1);
    expect(findIconOnlyControls(good)).toHaveLength(0);
    expect(findIconOnlyControls(withText)).toHaveLength(0);
  });

  it('ningún control solo-ícono del código carece de nombre accesible', () => {
    const offenders = [];
    for (const file of walk(srcRoot)) {
      const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
      for (const line of findIconOnlyControls(src)) {
        offenders.push(`${path.relative(srcRoot, file).split(path.sep).join('/')}:${line}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
