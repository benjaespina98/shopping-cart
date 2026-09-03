import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';
import { CartProvider } from '../context/CartContext';
import { productsAPI, projectsAPI, servicesAPI } from '../services/api';

vi.mock('../services/api', () => ({
  productsAPI: { getAll: vi.fn() },
  projectsAPI: { getAll: vi.fn() },
  servicesAPI: { getAll: vi.fn() },
}));

const renderLanding = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <Landing />
      </CartProvider>
    </MemoryRouter>
  );

describe('Landing — sección de proyectos destacados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsAPI.getAll.mockResolvedValue({ data: { products: [] } });
    servicesAPI.getAll.mockResolvedValue({ data: [] });
  });

  // Regresión: mientras /api/projects todavía no respondía, cualquier visitante veía el
  // texto "Cargá proyectos desde el admin" — pensado para cuando de verdad no hay ningún
  // proyecto cargado, no para "la respuesta está en camino".
  it('no muestra el mensaje de "cargá proyectos desde el admin" mientras la respuesta está en camino', async () => {
    let resolveProjects;
    projectsAPI.getAll.mockReturnValue(new Promise((resolve) => { resolveProjects = resolve; }));

    renderLanding();

    expect(screen.queryByText(/Cargá proyectos desde el admin/i)).not.toBeInTheDocument();

    resolveProjects({ data: [] });
    await waitFor(() => expect(screen.getByText(/Cargá proyectos desde el admin/i)).toBeInTheDocument());
  });

  it('muestra los proyectos destacados una vez que responde la API', async () => {
    projectsAPI.getAll.mockResolvedValue({
      data: [
        { _id: 'p1', title: 'Piscina infinity', location: 'Villa María', featured: true, isHero: true, imageUrl: '' },
        { _id: 'p2', title: 'Reforma de borde', location: 'Villa Nueva', featured: true, imageUrl: '' },
      ],
    });

    renderLanding();

    expect(await screen.findByText('Reforma de borde · Villa Nueva')).toBeInTheDocument();
    expect(screen.queryByText(/Cargá proyectos desde el admin/i)).not.toBeInTheDocument();
  });
});
