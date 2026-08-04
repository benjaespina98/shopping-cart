import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StrictMode, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { useReveal } from './useReveal';

// Doble de IntersectionObserver que deja disparar la intersección a mano y saber
// qué observers siguen conectados.
let instancias = [];

class IOFake {
  constructor(cb) {
    this.cb = cb;
    this.conectado = true;
    this.observados = [];
    instancias.push(this);
  }
  observe(node) { this.observados.push(node); }
  unobserve() {}
  disconnect() { this.conectado = false; }
  takeRecords() { return []; }
  entrarEnPantalla() { this.cb([{ isIntersecting: true }]); }
}

const activos = () => instancias.filter((i) => i.conectado && i.observados.length > 0);

function Seccion({ children = 'contenido' }) {
  const { ref, className } = useReveal();
  return <section ref={ref} className={className} data-testid="seccion">{children}</section>;
}

// Reproduce el caso real: una sección que sólo se renderiza cuando llegan los datos
// de la API, es decir, bastante después de que montó la página.
function PaginaConCargaDiferida() {
  const [cargado, setCargado] = useState(false);
  return (
    <div>
      <button onClick={() => setCargado(true)}>cargar</button>
      {cargado && <Seccion>productos destacados</Seccion>}
    </div>
  );
}

describe('useReveal', () => {
  beforeEach(() => {
    instancias = [];
    globalThis.IntersectionObserver = IOFake;
  });
  afterEach(() => { instancias = []; });

  it('arranca oculta y se revela al entrar en pantalla', () => {
    render(<Seccion />);
    const el = screen.getByTestId('seccion');

    expect(el.className).toBe('ps-reveal');
    act(() => activos()[0].entrarEnPantalla());
    expect(el.className).toContain('ps-reveal-visible');
  });

  it('observa las secciones que montan después, cuando llegan los datos', () => {
    render(<PaginaConCargaDiferida />);
    // Antes de que existan los datos no hay nada que observar.
    expect(activos()).toHaveLength(0);

    act(() => screen.getByText('cargar').click());

    // Acá estaba el bug: el hook creaba el observer en un efecto de montaje de la
    // página, cuando esta sección todavía no existía, y nunca lo reintentaba.
    expect(activos()).toHaveLength(1);
    act(() => activos()[0].entrarEnPantalla());
    expect(screen.getByTestId('seccion').className).toContain('ps-reveal-visible');
  });

  it('sigue con un observer vivo tras el doble montaje de StrictMode', () => {
    render(<StrictMode><Seccion /></StrictMode>);

    // El cleanup del primer montaje no puede llevarse puesto el observer del segundo.
    expect(activos().length).toBeGreaterThanOrEqual(1);
    act(() => activos()[0].entrarEnPantalla());
    expect(screen.getByTestId('seccion').className).toContain('ps-reveal-visible');
  });

  it('muestra la sección si ya quedó por encima del viewport al montar', () => {
    // Sección que monta tarde cuando el visitante ya scrolleó más abajo: nunca va a
    // volver a "entrar" en pantalla, así que no puede quedarse invisible.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = () => ({ bottom: -500, top: -900, height: 400 });

    render(<Seccion />);

    expect(screen.getByTestId('seccion').className).toContain('ps-reveal-visible');
    expect(activos()).toHaveLength(0);
    Element.prototype.getBoundingClientRect = original;
  });

  it('muestra el contenido si el navegador no soporta IntersectionObserver', () => {
    const original = globalThis.IntersectionObserver;
    delete globalThis.IntersectionObserver;

    render(<Seccion />);

    expect(screen.getByTestId('seccion').className).toContain('ps-reveal-visible');
    globalThis.IntersectionObserver = original;
  });

  it('desconecta el observer al desmontar', () => {
    const { unmount } = render(<Seccion />);
    const observer = activos()[0];

    unmount();

    expect(observer.conectado).toBe(false);
  });

  it('revela igual si el observer nunca se dispara', () => {
    vi.useFakeTimers();
    try {
      render(<Seccion />);
      expect(screen.getByTestId('seccion').className).toBe('ps-reveal');

      // La animación es un adorno: el contenido no puede quedar invisible porque el
      // observer no llegó a avisar.
      act(() => vi.advanceTimersByTime(3000));

      expect(screen.getByTestId('seccion').className).toContain('ps-reveal-visible');
    } finally {
      vi.useRealTimers();
    }
  });
});
