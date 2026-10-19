import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './PublicLayout';

vi.mock('./Navbar', () => ({ default: () => <nav aria-label="Principal"><a href="/tienda">Tienda</a></nav> }));
vi.mock('./RouteWarmup', () => ({ default: () => null }));
vi.mock('./Footer', () => ({ default: () => <footer>pie</footer> }));
vi.mock('../ui/CartDrawer', () => ({ default: () => <aside aria-label="Carrito" /> }));
const cartState = vi.hoisted(() => ({ isOpen: false }));
vi.mock('../../context/CartContext', () => ({ useCart: () => cartState }));
vi.mock('../ui/WhatsAppFloat', () => ({ default: () => null }));
vi.mock('../../utils/analytics', () => ({ initAnalytics: vi.fn(), trackPageview: vi.fn() }));
vi.mock('../../context/SettingsContext', () => ({ SettingsProvider: ({ children }) => children }));

beforeEach(() => {
  cartState.isOpen = false;
  delete window.requestIdleCallback;
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' });
});

const renderLayout = () => {
  window.scrollTo = vi.fn();
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<h1>Inicio</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('PublicLayout — enlace "Saltar al contenido"', () => {
  it('es el primer elemento enfocable y apunta al contenido principal', async () => {
    const user = userEvent.setup();
    renderLayout();

    const skip = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(skip).toHaveAttribute('href', '#contenido');

    await user.tab();
    expect(skip).toHaveFocus();
  });

  it('el <main> es el destino: tiene id "contenido" y puede recibir foco', () => {
    renderLayout();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'contenido');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('al activarlo con Enter, el foco pasa al contenido sin recorrer la navegación', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('main')).toHaveFocus();
  });
});

describe('PublicLayout — carrito fuera del camino crítico', () => {
  it('no monta el carrito en el primer render; lo monta tras load + idle', async () => {
    window.requestIdleCallback = (cb) => cb();
    renderLayout();
    expect(screen.queryByLabelText('Carrito')).toBeNull();

    act(() => { window.dispatchEvent(new Event('load')); });
    expect(await screen.findByLabelText('Carrito')).toBeInTheDocument();
  });

  it('una vez abierto el carrito queda montado aunque se cierre antes de load + idle', async () => {
    cartState.isOpen = true;
    const { rerender } = renderLayout();
    expect(await screen.findByLabelText('Carrito')).toBeInTheDocument();

    cartState.isOpen = false;
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<h1>Inicio</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Carrito')).toBeInTheDocument();
  });

  it('si el visitante abre el carrito antes de que cargue, se monta de inmediato', async () => {
    cartState.isOpen = true;
    renderLayout();
    expect(await screen.findByLabelText('Carrito')).toBeInTheDocument();
  });
});
