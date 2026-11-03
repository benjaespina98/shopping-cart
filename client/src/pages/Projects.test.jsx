import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Projects from './Projects';
import { projectsAPI } from '../services/api';

vi.mock('../services/api', () => ({ projectsAPI: { getAll: vi.fn() } }));

const renderProjects = () => render(<MemoryRouter><Projects /></MemoryRouter>);

describe('Projects', () => {
  beforeEach(() => vi.clearAllMocks());

  // Las fotos eran <div onClick>: no se podían abrir con el teclado ni las anunciaba un lector de pantalla.
  it('cada foto es un botón que abre la galería ampliada', async () => {
    projectsAPI.getAll.mockResolvedValue({
      data: [{ _id: 'p1', title: 'Piscina infinity', location: 'Villa Nueva', imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg' }],
    });
    const user = userEvent.setup();
    renderProjects();

    const boton = await screen.findByRole('button', { name: 'Ampliar la foto de Piscina infinity, Villa Nueva' });
    await user.click(boton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sin proyectos muestra un mensaje para visitantes, no instrucciones del panel', async () => {
    projectsAPI.getAll.mockResolvedValue({ data: [] });
    renderProjects();

    expect(await screen.findByText(/actualizando la galería/i)).toBeInTheDocument();
    expect(screen.queryByText(/panel de administración/i)).not.toBeInTheDocument();
  });
});
