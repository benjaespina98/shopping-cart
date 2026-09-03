import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminProducts from './AdminProducts';
import { productsAPI, categoriesAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  productsAPI: {
    getAllAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateStock: vi.fn(),
  },
  categoriesAPI: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'react-toastify';

const producto = (over = {}) => ({
  _id: 'p1',
  name: 'Cloro granulado 5kg',
  description: 'Para pileta',
  price: 12500,
  stock: 8,
  category: 'Limpieza',
  featured: false,
  active: true,
  tags: [],
  images: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const renderPage = () => render(<AdminProducts />);

describe('AdminProducts — CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoriesAPI.getAll.mockResolvedValue({ data: [{ _id: 'c1', name: 'Limpieza' }] });
    productsAPI.getAllAdmin.mockResolvedValue({ data: { products: [producto()] } });
  });

  it('lista los productos ya cargados', async () => {
    renderPage();

    expect(await screen.findByText('Cloro granulado 5kg')).toBeInTheDocument();
    expect(screen.getByText('1 producto · 1 categoría')).toBeInTheDocument();
  });

  it('crea un producto nuevo con los datos del formulario', async () => {
    const user = userEvent.setup();
    productsAPI.create.mockResolvedValue({ data: producto({ _id: 'p2', name: 'Filtro de arena' }) });

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));
    await user.type(screen.getByLabelText(/nombre \*/i), 'Filtro de arena');
    await user.type(screen.getByLabelText(/precio \*/i), '45000');
    await user.type(screen.getByLabelText(/stock \*/i), '3');
    await user.selectOptions(screen.getByLabelText(/categoría \*/i), 'Limpieza');

    await user.click(screen.getByRole('button', { name: /crear producto/i }));

    await waitFor(() => expect(productsAPI.create).toHaveBeenCalledTimes(1));
    const fd = productsAPI.create.mock.calls[0][0];
    expect(fd.get('name')).toBe('Filtro de arena');
    expect(fd.get('price')).toBe('45000');
    expect(fd.get('stock')).toBe('3');
    expect(fd.get('category')).toBe('Limpieza');
    expect(toast.success).toHaveBeenCalledWith('Producto creado');
    // Vuelve a pedir la lista para reflejar el producto nuevo.
    await waitFor(() => expect(productsAPI.getAllAdmin).toHaveBeenCalledTimes(2));
  });

  // Regresión: antes, si la categoría que necesitabas no existía, había que cancelar el
  // formulario, ir a la pestaña Categorías, crearla ahí, y volver a abrir "Nuevo producto"
  // desde cero para poder elegirla. Ahora se crea sin salir del formulario del producto.
  it('permite crear una categoría nueva sin salir del formulario de producto', async () => {
    const user = userEvent.setup();
    categoriesAPI.create.mockResolvedValue({ data: { _id: 'c2', name: 'Bombas y filtros' } });
    categoriesAPI.getAll
      .mockResolvedValueOnce({ data: [{ _id: 'c1', name: 'Limpieza' }] })
      .mockResolvedValueOnce({ data: [{ _id: 'c1', name: 'Limpieza' }, { _id: 'c2', name: 'Bombas y filtros' }] });

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));
    await user.click(screen.getByRole('button', { name: /nueva categoría/i }));
    await user.type(screen.getByPlaceholderText('Nombre de la categoría'), 'Bombas y filtros');
    await user.click(screen.getByRole('button', { name: /^crear$/i }));

    await waitFor(() => expect(categoriesAPI.create).toHaveBeenCalledWith({ name: 'Bombas y filtros' }));
    expect(toast.success).toHaveBeenCalledWith('Categoría creada');
    // Vuelve a pedir las categorías del padre y deja la nueva ya seleccionada en el form.
    await waitFor(() => expect(categoriesAPI.getAll).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText(/categoría \*/i)).toHaveValue('Bombas y filtros');
  });

  it('edita un producto existente precargando sus datos en el formulario', async () => {
    const user = userEvent.setup();
    productsAPI.update.mockResolvedValue({ data: producto({ name: 'Cloro granulado 10kg' }) });

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: 'Editar Cloro granulado 5kg' }));

    const nameInput = screen.getByLabelText(/nombre \*/i);
    expect(nameInput).toHaveValue('Cloro granulado 5kg');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cloro granulado 10kg');

    await user.click(screen.getByRole('button', { name: /actualizar/i }));

    await waitFor(() => expect(productsAPI.update).toHaveBeenCalledTimes(1));
    expect(productsAPI.update).toHaveBeenCalledWith('p1', expect.any(FormData));
    expect(productsAPI.update.mock.calls[0][1].get('name')).toBe('Cloro granulado 10kg');
    expect(toast.success).toHaveBeenCalledWith('Producto actualizado');
  });

  it('pide confirmación antes de borrar y refresca la lista al confirmar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    productsAPI.delete.mockResolvedValue({});

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: 'Eliminar Cloro granulado 5kg' }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(productsAPI.delete).toHaveBeenCalledWith('p1'));
    expect(toast.success).toHaveBeenCalledWith('Producto eliminado');
  });

  it('no borra nada si el admin cancela la confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: 'Eliminar Cloro granulado 5kg' }));

    expect(productsAPI.delete).not.toHaveBeenCalled();
  });

  it('actualiza el stock inline', async () => {
    const user = userEvent.setup();
    productsAPI.updateStock.mockResolvedValue({ data: producto({ stock: 20 }) });

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: 'Editar stock de Cloro granulado 5kg' }));
    const stockInput = screen.getByDisplayValue('8');
    await user.clear(stockInput);
    await user.type(stockInput, '20');
    await user.click(screen.getByTitle('Guardar stock'));

    await waitFor(() => expect(productsAPI.updateStock).toHaveBeenCalledWith('p1', 20));
    expect(toast.success).toHaveBeenCalledWith('Stock actualizado');
  });

  // Regresión: el form no valida esto — es la UI la que corta antes de llamar a la API.
  it('rechaza un stock negativo sin llamar a la API', async () => {
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Cloro granulado 5kg');

    await user.click(screen.getByRole('button', { name: 'Editar stock de Cloro granulado 5kg' }));
    const stockInput = screen.getByDisplayValue('8');
    await user.clear(stockInput);
    await user.type(stockInput, '-5');
    await user.click(screen.getByTitle('Guardar stock'));

    expect(productsAPI.updateStock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Ingresá un stock válido (0 o mayor)');
  });
});
