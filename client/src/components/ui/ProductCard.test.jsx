import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import { CartProvider } from '../../context/CartContext';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const producto = (over = {}) => ({
  _id: 'p1',
  name: 'Cloro granulado 5kg',
  description: 'Desinfección semanal del agua',
  price: 12500,
  stock: 10,
  category: 'Química del agua',
  images: [{ url: 'https://res.cloudinary.com/demo/image/upload/v1/cloro.jpg' }],
  ...over,
});

const renderCard = ({ product: over, ...props } = {}) =>
  render(
    <CartProvider>
      <ProductCard product={producto(over)} {...props} />
    </CartProvider>
  );

describe('ProductCard', () => {
  it('muestra nombre, categoría y precio formateado en pesos', () => {
    renderCard();

    expect(screen.getByText('Cloro granulado 5kg')).toBeInTheDocument();
    expect(screen.getByText('Química del agua')).toBeInTheDocument();
    expect(screen.getByText('12.500')).toBeInTheDocument();
  });

  it('actualiza el total al cambiar la cantidad', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByLabelText('Aumentar cantidad'));

    expect(screen.getByText('$25.000')).toBeInTheDocument();
  });

  it('no deja bajar de una unidad', async () => {
    const user = userEvent.setup();
    renderCard();

    expect(screen.getByLabelText('Reducir cantidad')).toBeDisabled();
    await user.click(screen.getByLabelText('Aumentar cantidad'));
    expect(screen.getByLabelText('Reducir cantidad')).toBeEnabled();
  });

  it('no deja elegir más unidades que el stock disponible', async () => {
    const user = userEvent.setup();
    renderCard({ product: { stock: 2 } });

    await user.click(screen.getByLabelText('Aumentar cantidad'));

    expect(screen.getByLabelText('Aumentar cantidad')).toBeDisabled();
  });

  it('descuenta lo que ya está en el carrito del stock que ofrece', () => {
    renderCard({ product: { stock: 5 }, inCartQuantity: 3 });

    expect(screen.getByText('Disponibles para sumar: 2')).toBeInTheDocument();
  });

  it('bloquea el botón cuando el carrito ya tiene todo el stock', () => {
    renderCard({ product: { stock: 3 }, inCartQuantity: 3 });

    expect(screen.getByRole('button', { name: /límite de stock/i })).toBeDisabled();
    expect(screen.getByText(/ya agregaste todo el stock disponible/i)).toBeInTheDocument();
  });

  it('marca el producto agotado y esconde los controles de compra', () => {
    renderCard({ product: { stock: 0 } });

    expect(screen.getByText('Sin stock')).toBeInTheDocument();
    expect(screen.queryByLabelText('Aumentar cantidad')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument();
  });

  it('avisa cuando quedan pocas unidades', () => {
    renderCard({ product: { stock: 3 } });

    expect(screen.getByText('Últimas 3 unidades')).toBeInTheDocument();
  });

  it('confirma visualmente que el producto se agregó', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: /agregar/i }));

    expect(await screen.findByText('¡Agregado!')).toBeInTheDocument();
  });

  it('abre el detalle al hacer click en la foto', async () => {
    const user = userEvent.setup();
    const onOpenDetail = vi.fn();
    renderCard({ onOpenDetail });

    await user.click(screen.getByLabelText('Ver detalle de Cloro granulado 5kg'));

    expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ _id: 'p1' }));
  });

  it('muestra un lugar para la foto cuando el producto no tiene ninguna', () => {
    renderCard({ product: { images: [] } });

    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
  });
});
