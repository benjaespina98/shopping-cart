import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { Photo } from './Photo';

const CLD = 'https://res.cloudinary.com/demo/image/upload/v1/shopping-cart/projects/hero.jpg';
const OTHER = 'https://ejemplo.test/fotos/hero.jpg';

describe('Photo — imágenes de Cloudinary', () => {
  it('el hero (priority) carga eager, con fetchpriority high y sin lazy', () => {
    const { container } = render(<Photo src={CLD} alt="Piscina" priority sizes="540px" height={460} />);
    const img = container.querySelector('img');

    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('una imagen común carga lazy y sin prioridad', () => {
    const { container } = render(<Photo src={CLD} alt="Piscina" height={280} />);
    const img = container.querySelector('img');

    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('fetchpriority')).toBeNull();
  });

  it('con /upload/ aplica f_auto,q_auto y un srcset con los anchos pedidos y sizes', () => {
    const { container } = render(
      <Photo src={CLD} alt="Piscina" sizes="(max-width: 767px) 100vw, 540px" srcSetWidths={[400, 800]} height={280} />
    );
    const img = container.querySelector('img');

    expect(img.getAttribute('src')).toContain('/upload/f_auto,q_auto,c_limit,w_');
    expect(img.getAttribute('srcset')).toBe(
      `${CLD.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_400/')} 400w, ${CLD.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_800/')} 800w`
    );
    expect(img.getAttribute('sizes')).toBe('(max-width: 767px) 100vw, 540px');
  });

  it('una URL que no es de Cloudinary no se transforma ni lleva srcset', () => {
    const { container } = render(<Photo src={OTHER} alt="Piscina" sizes="540px" srcSetWidths={[400, 800]} height={280} />);
    const img = container.querySelector('img');

    expect(img.getAttribute('src')).toBe(OTHER);
    expect(img.getAttribute('srcset')).toBeNull();
  });

  it('con src y placeholderDataUrl, la miniatura borrosa queda debajo de la foto (sin parpadeo entre ambas)', () => {
    const blur = 'data:image/webp;base64,AAAA';
    const { container } = render(<Photo src={CLD} alt="Piscina" priority sizes="540px" height={460} placeholderDataUrl={blur} />);
    const imgs = [...container.querySelectorAll('img')];

    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute('src')).toBe(blur);
    expect(imgs[0].getAttribute('aria-hidden')).toBe('true');
    expect(imgs[1].getAttribute('alt')).toBe('Piscina');
    expect(imgs[1].getAttribute('fetchpriority')).toBe('high');
  });

  it('el blur se retira solo después de que la foto cargó y terminó su fundido', () => {
    vi.useFakeTimers();
    try {
      const blur = 'data:image/webp;base64,AAAA';
      const { container } = render(<Photo src={CLD} alt="Piscina" priority sizes="540px" height={460} placeholderDataUrl={blur} />);
      expect(container.querySelectorAll('img')).toHaveLength(2);

      // sigue ahí mientras la foto no cargó, aunque pase el tiempo
      act(() => { vi.advanceTimersByTime(5000); });
      expect(container.querySelectorAll('img')).toHaveLength(2);

      fireEvent.load(container.querySelectorAll('img')[1]);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelectorAll('img')).toHaveLength(2); // a mitad del fundido

      act(() => { vi.advanceTimersByTime(500); });
      const imgs = container.querySelectorAll('img');
      expect(imgs).toHaveLength(1);
      expect(imgs[0].getAttribute('alt')).toBe('Piscina');
    } finally {
      vi.useRealTimers();
    }
  });
});
