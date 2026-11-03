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

  // Regresión: el visitante veía el texto "Cargá proyectos desde el admin" (una instrucción para quien
  // administra el sitio). Ahora, mientras la respuesta está en camino se ve el esqueleto, y si no hay
  // proyectos destacados la sección directamente no se muestra.
  it('sin proyectos destacados no muestra la sección ni textos del panel de administración', async () => {
    let resolveProjects;
    projectsAPI.getAll.mockReturnValue(new Promise((resolve) => { resolveProjects = resolve; }));

    renderLanding();

    expect(screen.getByRole('heading', { name: 'Algunas de nuestras obras' })).toBeInTheDocument();
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();

    resolveProjects({ data: [] });
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Algunas de nuestras obras' })).not.toBeInTheDocument());
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  });

  it('los accesos principales son enlaces reales (presupuesto y WhatsApp)', () => {
    projectsAPI.getAll.mockReturnValue(new Promise(() => {}));
    renderLanding();

    expect(screen.getAllByRole('link', { name: 'Pedir presupuesto' })[0]).toHaveAttribute('href', '/presupuesto');
    const whatsapp = screen.getAllByRole('link', { name: /WhatsApp/i })[0];
    expect(whatsapp.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('muestra todas las líneas de trabajo de respaldo, incluida la fibra INDUSPLAST', () => {
    projectsAPI.getAll.mockReturnValue(new Promise(() => {}));
    renderLanding();

    expect(screen.getByRole('heading', { name: 'Piscinas de fibra INDUSPLAST' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Climatización' })).toBeInTheDocument();
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
  });

  it('un hero sin imageUrl no muestra el blur de otra foto (queda la caja de marca)', async () => {
    projectsAPI.getAll.mockResolvedValue({ data: [{ _id: 'p1', title: 'Sin foto', location: 'Villa María', isHero: true, imageUrl: '' }] });
    const { container } = renderLanding();

    await waitFor(() => expect(screen.getByText(/Sin foto · Villa María/i)).toBeInTheDocument());
    expect(container.querySelector('img[src^="data:image"]')).toBeNull();
  });

  it('mientras no responde /api/projects muestra el blur embebido del hero', () => {
    projectsAPI.getAll.mockReturnValue(new Promise(() => {}));
    const { container } = renderLanding();
    expect(container.querySelector('img[src^="data:image"]')).not.toBeNull();
  });
});
