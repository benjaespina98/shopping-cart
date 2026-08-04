import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CldImage from './CldImage';

const CLD = 'https://res.cloudinary.com/demo/image/upload/v1/foto.jpg';

describe('CldImage', () => {
  it('pide el ancho de uso, no el original completo', () => {
    render(<CldImage src={CLD} alt="Cloro" width={640} />);

    expect(screen.getByAltText('Cloro')).toHaveAttribute(
      'src',
      expect.stringContaining('f_auto,q_auto,c_limit,w_640')
    );
  });

  it('difiere la carga por defecto y prioriza cuando se le pide', () => {
    const { rerender } = render(<CldImage src={CLD} alt="Cloro" />);
    expect(screen.getByAltText('Cloro')).toHaveAttribute('loading', 'lazy');
    expect(screen.getByAltText('Cloro')).not.toHaveAttribute('fetchpriority');

    rerender(<CldImage src={CLD} alt="Cloro" priority />);
    expect(screen.getByAltText('Cloro')).toHaveAttribute('loading', 'eager');
    // En minúscula: React 18 descarta `fetchPriority` en camelCase y la pista de
    // prioridad nunca llegaría al navegador.
    expect(screen.getByAltText('Cloro')).toHaveAttribute('fetchpriority', 'high');
  });

  it('sólo emite srcset cuando el que llama declaró sizes', () => {
    const { rerender } = render(<CldImage src={CLD} alt="Cloro" />);
    expect(screen.getByAltText('Cloro')).not.toHaveAttribute('srcset');

    rerender(<CldImage src={CLD} alt="Cloro" sizes="50vw" srcSetWidths={[320, 640]} />);
    const img = screen.getByAltText('Cloro');
    expect(img).toHaveAttribute('srcset', expect.stringContaining('320w'));
    expect(img).toHaveAttribute('sizes', '50vw');
  });

  it('revela la imagen recién cuando termina de cargar', () => {
    render(<CldImage src={CLD} alt="Cloro" />);
    const img = screen.getByAltText('Cloro');

    expect(img).toHaveStyle({ opacity: '0' });
    fireEvent.load(img);
    expect(img).toHaveStyle({ opacity: '1' });
  });

  it('no deja la foto invisible para siempre si la carga falla', () => {
    render(<CldImage src={CLD} alt="Cloro" />);
    const img = screen.getByAltText('Cloro');

    fireEvent.error(img);
    expect(img).toHaveStyle({ opacity: '1' });
  });

  it('muestra el contenido de respaldo cuando el producto no tiene foto', () => {
    render(<CldImage src="" alt="Cloro" fallback={<span>Sin imagen</span>} />);

    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
