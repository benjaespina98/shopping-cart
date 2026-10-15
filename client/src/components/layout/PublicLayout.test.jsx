import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './PublicLayout';

vi.mock('./Navbar', () => ({ default: () => <nav aria-label="Principal"><a href="/tienda">Tienda</a></nav> }));
vi.mock('./Footer', () => ({ default: () => <footer>pie</footer> }));
vi.mock('../ui/CartDrawer', () => ({ default: () => null }));
vi.mock('../ui/WhatsAppFloat', () => ({ default: () => null }));
vi.mock('../../utils/analytics', () => ({ initAnalytics: vi.fn(), trackPageview: vi.fn() }));
vi.mock('../../context/SettingsContext', () => ({ SettingsProvider: ({ children }) => children }));

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
