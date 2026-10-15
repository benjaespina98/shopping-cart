import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartDrawer from './CartDrawer';
import { CartProvider, useCart } from '../../context/CartContext';

vi.mock('../../services/api', () => ({ ordersAPI: { create: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Botón de la barra que abre el carrito: es el "opener" al que tiene que volver el foco.
function Abridor() {
  const { toggleCart } = useCart();
  return (
    <button type="button" onClick={toggleCart}>
      Abrir carrito
    </button>
  );
}

const item = { productId: 'p1', name: 'Cloro granulado 5kg', price: 12500, quantity: 2, stock: 10, image: '' };

const renderConItem = () => {
  localStorage.setItem('cart_items', JSON.stringify([item]));
  return render(
    <CartProvider>
      <Abridor />
      <CartDrawer />
    </CartProvider>
  );
};

describe('CartDrawer — diálogo accesible', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('tiene role="dialog", aria-modal y un nombre que sale de su título (aria-labelledby)', async () => {
    const user = userEvent.setup();
    renderConItem();
    await user.click(screen.getByRole('button', { name: 'Abrir carrito' }));

    const dialog = screen.getByRole('dialog', { name: /carrito/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId)).toHaveTextContent(/carrito/i);
    expect(dialog).not.toHaveAttribute('aria-label');
  });

  it('al abrir, el foco inicial queda dentro del diálogo (botón de cerrar)', async () => {
    const user = userEvent.setup();
    renderConItem();
    await user.click(screen.getByRole('button', { name: 'Abrir carrito' }));

    expect(screen.getByRole('button', { name: 'Cerrar carrito' })).toHaveFocus();
  });

  it('Tab y Shift+Tab ciclan dentro del diálogo (trampa de foco)', async () => {
    const user = userEvent.setup();
    renderConItem();
    await user.click(screen.getByRole('button', { name: 'Abrir carrito' }));
    const dialog = screen.getByRole('dialog');

    const focusables = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([tabindex="-1"])')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    expect(dialog.contains(first)).toBe(true);

    last.focus();
    await user.tab();
    expect(first).toHaveFocus();

    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it('muchos Tab seguidos nunca sacan el foco del diálogo', async () => {
    const user = userEvent.setup();
    renderConItem();
    await user.click(screen.getByRole('button', { name: 'Abrir carrito' }));
    const dialog = screen.getByRole('dialog');

    for (let i = 0; i < 25; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('Escape cierra el carrito y devuelve el foco al botón que lo abrió', async () => {
    const user = userEvent.setup();
    renderConItem();
    const abridor = screen.getByRole('button', { name: 'Abrir carrito' });
    await user.click(abridor);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');

    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
    expect(abridor).toHaveFocus();
  });

  it('cerrar con el botón también devuelve el foco al opener', async () => {
    const user = userEvent.setup();
    renderConItem();
    const abridor = screen.getByRole('button', { name: 'Abrir carrito' });
    await user.click(abridor);
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }));

    expect(abridor).toHaveFocus();
  });
});
