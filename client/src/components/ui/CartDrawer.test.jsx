import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartDrawer from './CartDrawer';
import { CartProvider, useCart } from '../../context/CartContext';
import { ordersAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  ordersAPI: { create: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'react-toastify';

// El drawer arranca cerrado (CartContext.isOpen = false) y no hay forma de abrirlo desde
// afuera salvo por toggleCart(); este componente lo abre apenas monta, para poder probar
// el drawer aislado sin pasar por el ícono del carrito en la Navbar.
function AbreElCarrito() {
  const { toggleCart } = useCart();
  useEffect(() => { toggleCart(); }, [toggleCart]);
  return null;
}

const itemGuardado = (over = {}) => ({
  productId: 'p1',
  name: 'Cloro granulado 5kg',
  price: 12500,
  quantity: 2,
  stock: 10,
  image: '',
  ...over,
});

const renderDrawerConItem = (item = itemGuardado()) => {
  localStorage.setItem('cart_items', JSON.stringify([item]));
  return render(
    <CartProvider>
      <AbreElCarrito />
      <CartDrawer />
    </CartProvider>
  );
};

describe('CartDrawer — checkout por WhatsApp', () => {
  let popup;

  beforeEach(() => {
    vi.clearAllMocks();
    popup = { closed: false, location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(popup);
  });

  it('crea el pedido, abre WhatsApp en la pestaña ya reservada y vacía el carrito', async () => {
    const user = userEvent.setup();
    ordersAPI.create.mockResolvedValue({ data: { whatsappUrl: 'https://wa.me/5493534224605?text=hola' } });

    renderDrawerConItem();

    await screen.findByText('Cloro granulado 5kg');
    await user.click(screen.getByRole('button', { name: /finalizar compra/i }));

    await waitFor(() => expect(ordersAPI.create).toHaveBeenCalledTimes(1));
    expect(ordersAPI.create).toHaveBeenCalledWith({ items: [{ productId: 'p1', quantity: 2 }] });

    // Reserva la pestaña ANTES de esperar la respuesta del server (para que el navegador no
    // la trate como popup bloqueado) y recién ahí la redirige a la URL de WhatsApp.
    expect(window.open).toHaveBeenCalledWith('', '_blank');
    await waitFor(() => expect(popup.location.href).toBe('https://wa.me/5493534224605?text=hola'));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(JSON.parse(localStorage.getItem('cart_items'))).toEqual([]);
  });

  it('si el pedido falla, cierra la pestaña reservada y conserva el carrito', async () => {
    const user = userEvent.setup();
    ordersAPI.create.mockRejectedValue({ response: { data: { message: 'Sin stock' } } });

    renderDrawerConItem();

    await screen.findByText('Cloro granulado 5kg');
    await user.click(screen.getByRole('button', { name: /finalizar compra/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Sin stock'));
    expect(popup.close).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('cart_items'))).toHaveLength(1);
  });

  it('no deja subir la cantidad por encima del stock disponible', async () => {
    renderDrawerConItem(itemGuardado({ quantity: 10, stock: 10 }));

    await screen.findByText('Cloro granulado 5kg');
    expect(screen.getByRole('button', { name: /sumar unidad/i })).toBeDisabled();
  });
});
