import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const producto = (over = {}) => ({
  _id: 'p1',
  name: 'Cloro granulado 5kg',
  price: 12500,
  stock: 10,
  images: [{ url: 'https://res.cloudinary.com/demo/image/upload/v1/cloro.jpg' }],
  ...over,
});

const setupCart = () => renderHook(() => useCart(), { wrapper: CartProvider });

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('agrega un producto con su precio, imagen y cantidad', () => {
    const { result } = setupCart();

    act(() => result.current.addItem(producto(), 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      productId: 'p1',
      name: 'Cloro granulado 5kg',
      quantity: 2,
      stock: 10,
    });
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(25000);
  });

  it('suma cantidades al agregar dos veces el mismo producto', () => {
    const { result } = setupCart();

    act(() => result.current.addItem(producto(), 2));
    act(() => result.current.addItem(producto(), 3));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('nunca deja acumular más unidades que el stock disponible', () => {
    const { result } = setupCart();

    act(() => result.current.addItem(producto({ stock: 3 }), 2));
    act(() => result.current.addItem(producto({ stock: 3 }), 5));

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('acota la cantidad editada entre 1 y el stock', () => {
    const { result } = setupCart();
    act(() => result.current.addItem(producto({ stock: 4 }), 1));

    act(() => result.current.updateQty('p1', 99));
    expect(result.current.items[0].quantity).toBe(4);

    act(() => result.current.updateQty('p1', 0));
    expect(result.current.items[0].quantity).toBe(1);

    act(() => result.current.updateQty('p1', -5));
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('calcula el total sumando precio por cantidad de cada línea', () => {
    const { result } = setupCart();

    act(() => result.current.addItem(producto({ _id: 'a', price: 1000 }), 2));
    act(() => result.current.addItem(producto({ _id: 'b', price: 250 }), 3));

    expect(result.current.totalItems).toBe(5);
    expect(result.current.totalPrice).toBe(2750);
  });

  it('elimina una línea y vacía el carrito', () => {
    const { result } = setupCart();
    act(() => result.current.addItem(producto({ _id: 'a' }), 1));
    act(() => result.current.addItem(producto({ _id: 'b' }), 1));

    act(() => result.current.removeItem('a'));
    expect(result.current.items.map((i) => i.productId)).toEqual(['b']);

    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.totalPrice).toBe(0);
  });

  it('guarda el carrito y lo recupera al volver a entrar', () => {
    const primera = setupCart();
    act(() => primera.result.current.addItem(producto(), 2));
    primera.unmount();

    const segunda = setupCart();
    expect(segunda.result.current.items).toHaveLength(1);
    expect(segunda.result.current.items[0].quantity).toBe(2);
  });

  it('descarta del storage las líneas cuya cantidad ya supera el stock', () => {
    localStorage.setItem('cart_items', JSON.stringify([
      { productId: 'valido',   name: 'ok',       price: 100, quantity: 1, stock: 5 },
      { productId: 'sinStock', name: 'agotado',  price: 100, quantity: 9, stock: 2 },
      { productId: 'roto',     name: 'sin stock definido', price: 100, quantity: 1 },
    ]));

    const { result } = setupCart();

    expect(result.current.items.map((i) => i.productId)).toEqual(['valido']);
  });

  it('arranca vacío si el storage tiene datos corruptos', () => {
    localStorage.setItem('cart_items', 'no-es-json');

    const { result } = setupCart();

    expect(result.current.items).toEqual([]);
  });
});
