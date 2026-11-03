import { describe, it, expect } from 'vitest';
import { whatsappUrl, whatsappMessageFor, WHATSAPP_GREETING } from './whatsapp';

describe('whatsappUrl', () => {
  it('arma el enlace con el mensaje codificado', () => {
    expect(whatsappUrl('5493534224605', 'Hola! ¿Qué tal?')).toBe(
      'https://wa.me/5493534224605?text=Hola!%20%C2%BFQu%C3%A9%20tal%3F'
    );
  });

  it('deja solo los dígitos del número cargado en el panel', () => {
    expect(whatsappUrl('+54 9 3534-224605')).toBe(`https://wa.me/5493534224605?text=${encodeURIComponent(WHATSAPP_GREETING)}`);
    expect(whatsappUrl('5493534224605/../evil?x=')).toMatch(/^https:\/\/wa\.me\/5493534224605\?text=/);
  });

  it('sin mensaje devuelve el enlace pelado', () => {
    expect(whatsappUrl('5493534224605', '')).toBe('https://wa.me/5493534224605');
  });
});

describe('whatsappMessageFor', () => {
  it('elige el mensaje según la sección y cae al saludo general', () => {
    expect(whatsappMessageFor('/tienda')).toMatch(/tienda/i);
    expect(whatsappMessageFor('/servicios/')).toMatch(/servicios/i);
    expect(whatsappMessageFor('/')).toBe(WHATSAPP_GREETING);
    expect(whatsappMessageFor('/cualquier-cosa')).toBe(WHATSAPP_GREETING);
  });
});
