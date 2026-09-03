import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { CartProvider } from '../../context/CartContext';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <Navbar />
      </CartProvider>
    </MemoryRouter>
  );

describe('Navbar — menú móvil', () => {
  // Regresión: a diferencia del resto de los overlays del sitio (carrito, lightbox,
  // modal de producto), este menú solo se cerraba eligiendo un link o volviendo a tocar
  // el hamburger — ni Escape ni tocar afuera hacían nada.
  it('se cierra con Escape', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: 'Menú' }));
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0);

    await user.keyboard('{Escape}');
    // Solo queda el link de "Inicio" del nav de escritorio (oculto por CSS, pero en el
    // DOM); el del menú móvil desaparece porque el bloque entero se desmonta.
    expect(screen.getAllByRole('link', { name: 'Inicio' })).toHaveLength(1);
  });

  it('se cierra al tocar afuera', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: 'Menú' }));
    expect(screen.getAllByRole('link', { name: 'Inicio' })).toHaveLength(2);

    await user.click(document.body);
    expect(screen.getAllByRole('link', { name: 'Inicio' })).toHaveLength(1);
  });
});
