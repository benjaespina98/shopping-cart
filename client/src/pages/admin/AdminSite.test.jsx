import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSite from './AdminSite';
import { projectsAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  projectsAPI: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), reorder: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'react-toastify';

const proyecto = (over = {}) => ({
  _id: 'pr1', title: 'Piscina infinity', location: 'Villa Nueva',
  featured: false, isHero: false, imageUrl: '', order: 0,
  ...over,
});

const renderPage = () => render(<AdminSite />);

describe('AdminSite — proyectos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsAPI.getAll.mockResolvedValue({ data: [proyecto({ _id: 'a', title: 'Obra A', order: 0 }), proyecto({ _id: 'b', title: 'Obra B', order: 1 })] });
  });

  it('lista los proyectos ya cargados', async () => {
    renderPage();
    expect(await screen.findByText('Obra A')).toBeInTheDocument();
    expect(screen.getByText('Obra B')).toBeInTheDocument();
  });

  it('crea un proyecto con los datos del formulario y limpia el form al terminar', async () => {
    const user = userEvent.setup();
    projectsAPI.create.mockResolvedValue({});

    renderPage();
    await screen.findByText('Obra A');

    await user.type(screen.getByPlaceholderText('Piscina infinity'), 'Reforma de borde');
    await user.type(screen.getByPlaceholderText('Villa Nueva'), 'Villa María');
    const fileInput = document.querySelector('input[type="file"]');
    await user.upload(fileInput, new File(['foto'], 'obra.jpg', { type: 'image/jpeg' }));
    await user.click(screen.getByRole('button', { name: /agregar proyecto/i }));

    await waitFor(() => expect(projectsAPI.create).toHaveBeenCalledTimes(1));
    const fd = projectsAPI.create.mock.calls[0][0];
    expect(fd.get('title')).toBe('Reforma de borde');
    expect(fd.get('location')).toBe('Villa María');
    expect(fd.get('image').name).toBe('obra.jpg');
    expect(toast.success).toHaveBeenCalledWith('Proyecto agregado.');
    // El form vuelve a estar vacío listo para cargar el siguiente.
    expect(screen.getByPlaceholderText('Piscina infinity')).toHaveValue('');
  });

  // Regresión: un proyecto sin foto quedaba mostrando una caja vacía en el sitio público
  // en vez de una imagen — la galería es justamente eso, fotos de obras.
  it('no deja crear un proyecto sin elegir una foto', async () => {
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Obra A');

    await user.type(screen.getByPlaceholderText('Piscina infinity'), 'Reforma de borde');
    await user.type(screen.getByPlaceholderText('Villa Nueva'), 'Villa María');
    await user.click(screen.getByRole('button', { name: /agregar proyecto/i }));

    expect(toast.error).toHaveBeenCalledWith('Elegí una foto para el proyecto.');
    expect(projectsAPI.create).not.toHaveBeenCalled();
  });

  // Regresión del fix de la carrera al reordenar: un solo click dispara un único PUT
  // /reorder con el nuevo orden, y el botón de mover queda deshabilitado mientras viaja.
  it('manda el nuevo orden al mover un proyecto y llega a ambos con su índice actualizado', async () => {
    const user = userEvent.setup();
    projectsAPI.reorder.mockResolvedValue({});

    renderPage();
    await screen.findByText('Obra A');

    await user.click(screen.getByRole('button', { name: 'Mover "Obra A" hacia abajo' }));

    await waitFor(() => expect(projectsAPI.reorder).toHaveBeenCalledTimes(1));
    expect(projectsAPI.reorder).toHaveBeenCalledWith([
      { id: 'b', order: 0 },
      { id: 'a', order: 1 },
    ]);
  });

  it('si falla el reordenamiento, avisa y recarga la lista desde el server', async () => {
    const user = userEvent.setup();
    projectsAPI.reorder.mockRejectedValue(new Error('network'));

    renderPage();
    await screen.findByText('Obra A');

    await user.click(screen.getByRole('button', { name: 'Mover "Obra A" hacia abajo' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al reordenar.'));
    // load() se llama de nuevo para volver a la foto real del servidor.
    await waitFor(() => expect(projectsAPI.getAll).toHaveBeenCalledTimes(2));
  });

  it('pide confirmación antes de borrar un proyecto', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();
    await screen.findByText('Obra A');

    await user.click(screen.getByRole('button', { name: 'Eliminar "Obra A"' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(projectsAPI.delete).not.toHaveBeenCalled();
  });
});
