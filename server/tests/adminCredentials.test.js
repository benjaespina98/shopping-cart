import { describe, it, expect } from 'vitest';
import { resolveAdminCredentials, MIN_ADMIN_PASSWORD_LENGTH } from '../config/env.js';

// Cubre la validación que usa server/scripts/seed.js. El seed en sí no se ejecuta
// en tests: arranca cargando server/.env y conectando a la base, así que correrlo
// podría tocar una base real. Por eso la regla vive en una función pura que recibe
// el entorno como parámetro.
describe('resolveAdminCredentials (seed)', () => {
  it('falla con un mensaje claro si falta ADMIN_PASSWORD', () => {
    expect(() => resolveAdminCredentials({})).toThrow(/Falta ADMIN_PASSWORD/);
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: '' })).toThrow(/Falta ADMIN_PASSWORD/);
  });

  it('no usa ningún valor por defecto cuando la contraseña falta', () => {
    let result;
    try {
      result = resolveAdminCredentials({ ADMIN_EMAIL: 'admin@example.test' });
    } catch {
      result = null;
    }
    expect(result).toBeNull();
  });

  it(`rechaza contraseñas de menos de ${MIN_ADMIN_PASSWORD_LENGTH} caracteres`, () => {
    const short = 'a'.repeat(MIN_ADMIN_PASSWORD_LENGTH - 1);
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: short })).toThrow(/demasiado corta/);
  });

  it('acepta una contraseña del largo mínimo y devuelve las credenciales', () => {
    const password = 'b'.repeat(MIN_ADMIN_PASSWORD_LENGTH);
    const creds = resolveAdminCredentials({ ADMIN_PASSWORD: password, ADMIN_EMAIL: ' ceo@example.test ' });
    expect(creds).toEqual({ email: 'ceo@example.test', password });
  });

  it('el mensaje de error no incluye la contraseña recibida', () => {
    const short = 'secret-pw';
    try {
      resolveAdminCredentials({ ADMIN_PASSWORD: short });
    } catch (err) {
      expect(err.message).not.toContain(short);
    }
  });
});
