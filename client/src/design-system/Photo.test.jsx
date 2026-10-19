import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
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
});
