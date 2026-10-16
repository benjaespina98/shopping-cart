import { describe, it, expect, vi } from 'vitest';
import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { lazyOptional } from './lazyOptional';

describe('lazyOptional', () => {
  it('renderiza el componente cuando el chunk carga', async () => {
    const Pieza = lazyOptional(() => Promise.resolve({ default: () => <p>listo</p> }));
    render(<Suspense fallback={null}><Pieza /></Suspense>);
    expect(await screen.findByText('listo')).toBeInTheDocument();
  });

  it('si el chunk falla, no rompe el árbol: renderiza vacío y deja el error en la consola', async () => {
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Pieza = lazyOptional(() => Promise.reject(new Error('Failed to fetch dynamically imported module')));
    const { container } = render(<Suspense fallback={null}><div data-testid="resto">resto</div><Pieza /></Suspense>);
    expect(await screen.findByTestId('resto')).toBeInTheDocument();
    await vi.waitFor(() => expect(consola).toHaveBeenCalled());
    expect(container.textContent).toBe('resto');
    consola.mockRestore();
  });
});
