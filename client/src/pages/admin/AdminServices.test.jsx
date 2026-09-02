import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminServices from './AdminServices';
import { servicesAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  servicesAPI: { getAllAdmin: vi.fn(), create: vi.fn(), update: vi.fn(), reorder: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'react-toastify';

const servicio = (over = {}) => ({
  _id: 's1', title: 'Piscinas de obra', tag: 'Construcción', description: 'Diseño y obra',
  bullets: [], tone: 'teal', variant: 'soft', cta: 'Solicitar presupuesto', active: true,
  imageUrl: '', order: 0,
  ...over,
});

const renderPage = () => render(<AdminServices />);

describe('AdminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    servicesAPI.getAllAdmin.mockResolvedValue({
      data: [servicio({ _id: 'a', title: 'Servicio A', order: 0 }), servicio({ _id: 'b', title: 'Servicio B', order: 1 })],
    });
  });

  it('lista los servicios ya cargados', async () => {
    renderPage();
    expect(await screen.findByText('Servicio A')).toBeInTheDocument();
    expect(screen.getByText('Servicio B')).toBeInTheDocument();
  });

  it('crea un servicio con los datos del formulario', async () => {
    const user = userEvent.setup();
    servicesAPI.create.mockResolvedValue({});

    renderPage();
    await screen.findByText('Servicio A');

    await user.type(screen.getByPlaceholderText('Piscinas de obra'), 'Mantenimiento mensual');
    await user.type(screen.getByPlaceholderText('Construcción'), 'Mantenimiento');
    await user.type(screen.getByPlaceholderText('Descripción del servicio...'), 'Visitas periódicas');
    await user.click(screen.getByRole('button', { name: /agregar servicio/i }));

    await waitFor(() => expect(servicesAPI.create).toHaveBeenCalledTimes(1));
    const fd = servicesAPI.create.mock.calls[0][0];
    expect(fd.get('title')).toBe('Mantenimiento mensual');
    expect(fd.get('tag')).toBe('Mantenimiento');
    expect(toast.success).toHaveBeenCalledWith('Servicio agregado.');
  });

  it('manda el nuevo orden al mover un servicio', async () => {
    const user = userEvent.setup();
    servicesAPI.reorder.mockResolvedValue({});

    renderPage();
    await screen.findByText('Servicio A');

    await user.click(screen.getByRole('button', { name: 'Mover "Servicio A" hacia abajo' }));

    await waitFor(() => expect(servicesAPI.reorder).toHaveBeenCalledTimes(1));
    expect(servicesAPI.reorder).toHaveBeenCalledWith([
      { id: 'b', order: 0 },
      { id: 'a', order: 1 },
    ]);
  });

  it('oculta y vuelve a mostrar un servicio con el toggle de ojo', async () => {
    const user = userEvent.setup();
    servicesAPI.update.mockResolvedValue({ data: servicio({ _id: 'a', title: 'Servicio A', active: false }) });

    renderPage();
    await screen.findByText('Servicio A');

    await user.click(screen.getByRole('button', { name: 'Ocultar "Servicio A" de la web' }));

    await waitFor(() => expect(servicesAPI.update).toHaveBeenCalledWith('a', expect.any(FormData)));
    expect(servicesAPI.update.mock.calls[0][1].get('active')).toBe('false');
    expect(toast.success).toHaveBeenCalledWith('Servicio oculto de la web');
  });

  it('pide confirmación antes de borrar un servicio', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();
    await screen.findByText('Servicio A');

    await user.click(screen.getByRole('button', { name: 'Eliminar "Servicio A"' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(servicesAPI.delete).not.toHaveBeenCalled();
  });
});
