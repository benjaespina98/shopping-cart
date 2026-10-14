import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('sin onClick es un contenedor común: no entra en el orden de tab', () => {
    render(<Card>contenido</Card>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con onClick se anuncia como botón y se puede enfocar con Tab', async () => {
    const user = userEvent.setup();
    render(<Card onClick={() => {}}>Servicio</Card>);

    const card = screen.getByRole('button', { name: 'Servicio' });
    expect(card).toHaveAttribute('tabindex', '0');

    await user.tab();
    expect(card).toHaveFocus();
  });

  it.each([
    ['Enter', '{Enter}'],
    ['Espacio', ' '],
  ])('se activa con %s', async (_name, key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Servicio</Card>);

    await user.tab();
    await user.keyboard(key);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no roba las teclas de un control que está adentro', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card onClick={onClick}>
        <input aria-label="Cantidad" />
      </Card>
    );

    await user.click(screen.getByLabelText('Cantidad'));
    onClick.mockClear();
    await user.keyboard(' ');

    expect(onClick).not.toHaveBeenCalled();
  });
});
