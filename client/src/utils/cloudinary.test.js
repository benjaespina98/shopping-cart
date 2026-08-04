import { describe, it, expect } from 'vitest';
import { isCloudinary, cldUrl, cldOptimized, cldSrcSet, cldPlaceholder } from './cloudinary';

const CLD = 'https://res.cloudinary.com/demo/image/upload/v1699999999/shopping-cart/products/foto.jpg';

describe('cloudinary', () => {
  describe('isCloudinary', () => {
    it('reconoce una URL de entrega de Cloudinary', () => {
      expect(isCloudinary(CLD)).toBe(true);
    });

    it('rechaza URLs de otros orígenes y valores no string', () => {
      expect(isCloudinary('https://example.com/foto.jpg')).toBe(false);
      expect(isCloudinary('')).toBe(false);
      expect(isCloudinary(undefined)).toBe(false);
      expect(isCloudinary(null)).toBe(false);
      expect(isCloudinary(42)).toBe(false);
    });
  });

  describe('cldUrl', () => {
    it('inserta la transformación justo después de /image/upload/', () => {
      expect(cldUrl(CLD, 'w_300')).toBe(
        'https://res.cloudinary.com/demo/image/upload/w_300/v1699999999/shopping-cart/products/foto.jpg'
      );
    });

    it('devuelve la URL intacta si no es de Cloudinary o no hay transformación', () => {
      const externa = 'https://example.com/foto.jpg';
      expect(cldUrl(externa, 'w_300')).toBe(externa);
      expect(cldUrl(CLD, '')).toBe(CLD);
      expect(cldUrl(CLD, undefined)).toBe(CLD);
    });
  });

  describe('cldOptimized', () => {
    it('pide formato y calidad automáticos con el ancho indicado', () => {
      expect(cldOptimized(CLD, 640)).toContain('/image/upload/f_auto,q_auto,c_limit,w_640/');
    });

    it('usa c_limit para no reescalar hacia arriba un original más chico', () => {
      expect(cldOptimized(CLD, 2000)).toContain('c_limit');
    });

    it('no toca imágenes que no vienen de Cloudinary', () => {
      const externa = 'https://example.com/foto.jpg';
      expect(cldOptimized(externa, 640)).toBe(externa);
    });
  });

  describe('cldSrcSet', () => {
    it('genera un descriptor por cada ancho pedido', () => {
      const srcSet = cldSrcSet(CLD, [320, 640]);
      const entradas = srcSet.split(', ');

      expect(entradas).toHaveLength(2);
      expect(entradas[0]).toContain('w_320');
      expect(entradas[0].endsWith(' 320w')).toBe(true);
      expect(entradas[1].endsWith(' 640w')).toBe(true);
    });

    it('devuelve undefined para URLs externas, así el <img> no emite un srcset roto', () => {
      expect(cldSrcSet('https://example.com/foto.jpg')).toBeUndefined();
    });
  });

  describe('cldPlaceholder', () => {
    it('pide una miniatura difuminada, que es lo que se ve mientras carga la foto', () => {
      const placeholder = cldPlaceholder(CLD);
      expect(placeholder).toContain('w_32');
      expect(placeholder).toContain('e_blur:800');
    });
  });
});
