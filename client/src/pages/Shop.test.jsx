import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Shop from './Shop';
import { CartProvider } from '../context/CartContext';
import { productsAPI, categoriesAPI } from '../services/api';

vi.mock('../services/api', () => ({
  productsAPI: { getAll: vi.fn() },
  categoriesAPI: { getAll: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const producto = (i) => ({
  _id: `p${i}`,
  name: `Producto ${i}`,
  description: 'Descripción',
  price: 1000 * i,
  stock: 5,
  category: 'Limpieza',
  images: [],
});

const respuesta = (productos, extra = {}) => ({
  data: { products: productos, total: productos.length, pages: 1, ...extra },
});

const renderShop = () => render(<CartProvider><Shop /></CartProvider>);

describe('Shop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoriesAPI.getAll.mockResolvedValue({ data: [{ name: 'Limpieza' }, { name: 'Climatización' }] });
    productsAPI.getAll.mockResolvedValue(respuesta([producto(1), producto(2)]));
  });

  it('lista los productos y cuántos hay', async () => {
    renderShop();

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText(/^2 productos/)).toBeInTheDocument();
  });

  it('muestra las categorías que administra el panel', async () => {
    renderShop();

    expect(await screen.findByRole('button', { name: 'Climatización' })).toBeInTheDocument();
  });

  it('cae en las categorías de respaldo si la API falla, sin romper la tienda', async () => {
    categoriesAPI.getAll.mockRejectedValue(new Error('network'));
    renderShop();

    expect(await screen.findByRole('button', { name: 'Química del agua' })).toBeInTheDocument();
  });

  it('filtra por categoría y permite deseleccionarla tocándola de nuevo', async () => {
    const user = userEvent.setup();
    renderShop();
    await screen.findByText('Producto 1');

    await user.click(screen.getByRole('button', { name: 'Limpieza' }));
    await waitFor(() =>
      expect(productsAPI.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'Limpieza' }))
    );

    await user.click(screen.getByRole('button', { name: 'Limpieza' }));
    await waitFor(() => {
      const ultima = productsAPI.getAll.mock.lastCall[0];
      expect(ultima.category).toBeUndefined();
    });
  });

  it('espera a que el visitante deje de tipear antes de buscar', async () => {
    const user = userEvent.setup();
    renderShop();
    await screen.findByText('Producto 1');
    productsAPI.getAll.mockClear();

    await user.type(screen.getByPlaceholderText('Buscar productos...'), 'cloro');

    // Sin debounce serían cinco peticiones, una por tecla.
    await waitFor(() =>
      expect(productsAPI.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'cloro' }))
    );
    expect(productsAPI.getAll).toHaveBeenCalledTimes(1);
  });

  it('pide el orden elegido al servidor', async () => {
    const user = userEvent.setup();
    renderShop();
    await screen.findByText('Producto 1');

    await user.selectOptions(screen.getByRole('combobox'), 'price_asc');

    await waitFor(() =>
      expect(productsAPI.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'price_asc' }))
    );
  });

  it('ofrece limpiar los filtros cuando la búsqueda no encuentra nada', async () => {
    const user = userEvent.setup();
    renderShop();
    await screen.findByText('Producto 1');

    productsAPI.getAll.mockResolvedValue(respuesta([]));
    await user.click(screen.getByRole('button', { name: 'Limpieza' }));

    expect(await screen.findByText('No se encontraron productos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    await waitFor(() => {
      const ultima = productsAPI.getAll.mock.lastCall[0];
      expect(ultima.category).toBeUndefined();
      expect(ultima.search).toBeUndefined();
    });
  });

  it('explica el error y deja reintentar si la tienda no carga', async () => {
    const user = userEvent.setup();
    productsAPI.getAll.mockRejectedValue(new Error('network'));
    renderShop();

    expect(await screen.findByText('Hubo un problema al cargar la tienda')).toBeInTheDocument();

    productsAPI.getAll.mockResolvedValue(respuesta([producto(1)]));
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
  });

  // Regresión: al pasar de página, la pantalla se quedaba en el pie de la grilla vieja
  // (donde está la paginación) mientras arriba ya habían cambiado los productos.
  it('sube el scroll al cambiar de página, pero no al entrar por primera vez', async () => {
    const user = userEvent.setup();
    productsAPI.getAll.mockResolvedValue(respuesta([producto(1)], { pages: 3, total: 30 }));
    renderShop();
    await screen.findByText('Producto 1');

    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');
    expect(scrollSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(scrollSpy).toHaveBeenCalled());
  });

  it('vuelve a la primera página al cambiar un filtro', async () => {
    const user = userEvent.setup();
    productsAPI.getAll.mockResolvedValue(respuesta([producto(1)], { pages: 3, total: 30 }));
    renderShop();
    await screen.findByText('Producto 1');

    await user.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(productsAPI.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));

    await user.click(screen.getByRole('button', { name: 'Limpieza' }));
    await waitFor(() => expect(productsAPI.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
  });
});
