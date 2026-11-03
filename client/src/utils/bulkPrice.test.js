import { describe, it, expect } from 'vitest';
import { computeNewPrice, parseNumber } from './bulkPrice';

describe('computeNewPrice', () => {
  it('aumenta y baja por porcentaje', () => {
    expect(computeNewPrice(1000, { mode: 'percent_up', value: '10' })).toBe(1100);
    expect(computeNewPrice(1000, { mode: 'percent_down', value: '15' })).toBe(850);
  });

  it('suma y resta un monto fijo', () => {
    expect(computeNewPrice(1000, { mode: 'amount_up', value: '250' })).toBe(1250);
    expect(computeNewPrice(1000, { mode: 'amount_down', value: '250' })).toBe(750);
  });

  it('acepta coma decimal', () => {
    expect(parseNumber('12,5')).toBe(12.5);
    expect(computeNewPrice(1000, { mode: 'percent_up', value: '12,5' })).toBe(1125);
  });

  it('redondea a pesos enteros o al múltiplo elegido', () => {
    expect(computeNewPrice(999, { mode: 'percent_up', value: '3.3', rounding: '1' })).toBe(1032);
    expect(computeNewPrice(1234, { mode: 'percent_up', value: '10', rounding: '100' })).toBe(1400);
    expect(computeNewPrice(1234, { mode: 'percent_up', value: '10', rounding: '10' })).toBe(1360);
  });

  it('con dos decimales evita arrastrar errores de punto flotante', () => {
    expect(computeNewPrice(100.1, { mode: 'percent_up', value: '10' })).toBe(110.11);
  });

  it('nunca deja un precio negativo', () => {
    expect(computeNewPrice(100, { mode: 'amount_down', value: '500' })).toBe(0);
    expect(computeNewPrice(100, { mode: 'percent_down', value: '150' })).toBe(0);
  });

  it('devuelve null con un valor vacío, negativo o que no es número', () => {
    for (const value of ['', 'abc', '-5', undefined]) {
      expect(computeNewPrice(100, { mode: 'percent_up', value })).toBeNull();
    }
    expect(computeNewPrice(100, { mode: 'otro', value: '5' })).toBeNull();
  });
});
