import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button } from './Button';

describe('Button', () => {
  // Los botones que navegaban con onClick={navigate(...)} no se podían abrir en otra pestaña ni los seguía un rastreador.
  it('con `to` es un enlace de la app', () => {
    render(<MemoryRouter><Button to="/presupuesto">Pedir presupuesto</Button></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Pedir presupuesto' })).toHaveAttribute('href', '/presupuesto');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('con `href` es un enlace externo y sin ellos un botón', () => {
    render(
      <MemoryRouter>
        <Button href="https://wa.me/5493534224605" target="_blank" rel="noopener noreferrer">WhatsApp</Button>
        <Button>Enviar</Button>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'button');
  });
});
