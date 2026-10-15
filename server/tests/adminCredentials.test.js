import { describe, it, expect } from 'vitest';
import { resolveAdminCredentials, MIN_ADMIN_PASSWORD_LENGTH } from '../config/env.js';

// Cubre la validación que usa server/scripts/seed.js. El seed en sí no se ejecuta
// en tests: arranca cargando server/.env y conectando a la base, así que correrlo
// podría tocar una base real. Por eso la regla vive en una función pura que recibe
// el entorno como parámetro.
const STRONG = 'b'.repeat(MIN_ADMIN_PASSWORD_LENGTH);
const EMAIL = 'admin@example.test';

describe('resolveAdminCredentials (seed)', () => {
  it('falla con un mensaje claro si falta ADMIN_PASSWORD', () => {
    expect(() => resolveAdminCredentials({})).toThrow(/Falta ADMIN_PASSWORD/);
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: '' })).toThrow(/Falta ADMIN_PASSWORD/);
  });

  it('no usa ningún valor por defecto cuando la contraseña falta', () => {
    expect(() => resolveAdminCredentials({ ADMIN_EMAIL: EMAIL })).toThrow();
  });

  it(`rechaza contraseñas de menos de ${MIN_ADMIN_PASSWORD_LENGTH} caracteres`, () => {
    const short = 'a'.repeat(MIN_ADMIN_PASSWORD_LENGTH - 1);
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: short, ADMIN_EMAIL: EMAIL })).toThrow(
      /demasiado corta/
    );
  });

  it('exige ADMIN_EMAIL: no inventa un email por defecto', () => {
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: STRONG })).toThrow(/Falta ADMIN_EMAIL/);
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: STRONG, ADMIN_EMAIL: '   ' })).toThrow(
      /Falta ADMIN_EMAIL/
    );
  });

  it.each([
    'sin-arroba',
    'a@b',
    'a b@example.test',
    'a@@example.test',
    '<a>@example.test',
    'a@example.test\r\nBcc: x@example.test',
  ])('rechaza un ADMIN_EMAIL con formato inválido (%j)', (email) => {
    expect(() => resolveAdminCredentials({ ADMIN_PASSWORD: STRONG, ADMIN_EMAIL: email })).toThrow(
      /formato de email válido/
    );
  });

  it('acepta credenciales válidas, recorta y pasa el email a minúsculas', () => {
    const creds = resolveAdminCredentials({ ADMIN_PASSWORD: STRONG, ADMIN_EMAIL: ' CEO@Example.test ' });
    expect(creds).toEqual({ email: 'ceo@example.test', password: STRONG });
  });

  it('los mensajes de error no incluyen la contraseña recibida', () => {
    const short = 'secret-pw';
    try {
      resolveAdminCredentials({ ADMIN_PASSWORD: short, ADMIN_EMAIL: EMAIL });
      throw new Error('debía fallar');
    } catch (err) {
      expect(err.message).not.toContain(short);
    }
  });
});
