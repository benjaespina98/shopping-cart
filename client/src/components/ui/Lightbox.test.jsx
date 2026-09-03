import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Lightbox } from './Lightbox';

const images = [
  { src: 'https://res.cloudinary.com/demo/image/upload/v1/obra-a.jpg', label: 'Obra A' },
  { src: 'https://res.cloudinary.com/demo/image/upload/v1/obra-b.jpg', label: 'Obra B' },
];

describe('Lightbox', () => {
  // Regresión: era la única imagen del sitio servida sin f_auto/q_auto/límite de ancho —
  // el original de Cloudinary puede pesar varios MB, y es la que se ve a pantalla completa.
  it('pide la imagen optimizada de Cloudinary, no la URL cruda', () => {
    render(<Lightbox images={images} index={0} onClose={vi.fn()} />);

    const img = screen.getByAltText('Obra A');
    expect(img.src).toContain('f_auto,q_auto,c_limit,w_1600');
    expect(img.src).not.toBe(images[0].src);
  });
});
