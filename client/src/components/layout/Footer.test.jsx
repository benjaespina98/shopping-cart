import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

vi.mock('../../services/api', () => ({ servicesAPI: { getAll: vi.fn(() => Promise.resolve({ data: [] })) } }));
vi.mock('../../context/SettingsContext', () => ({ useSettings: () => ({ settings: { whatsappNumber: '5493530000000', phoneNumberLink: 'tel:+543530000000', phoneNumberDisplay: '353 000-0000', contactEmail: 'hola@example.com' } }) }));

describe('Footer — encabezados', () => {
  // Lighthouse: "Heading elements are not in a sequentially-descending order" (h2 -> h4).
  it('los títulos de columna son h2 (no saltan niveles) y no hay h4', async () => {
    const { container } = render(<MemoryRouter><Footer /></MemoryRouter>);

    expect(container.querySelector('h4')).toBeNull();
    const titulos = await screen.findAllByRole('heading', { level: 2 });
    expect(titulos.length).toBeGreaterThanOrEqual(2);
  });
});
