import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken, adminAuth } from './helpers.js';

describe('Settings — validación de los datos de contacto', () => {
  let app;
  let mongod;
  let token;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
  });

  beforeEach(async () => {
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  const save = (body) => request(app).put('/api/settings/admin').set(adminAuth(token)).send(body);

  it('guarda datos válidos y normaliza el WhatsApp a solo dígitos', async () => {
    const res = await save({
      contactEmail: 'ventas@playaysol.com.ar',
      whatsappNumber: '+54 9 3534-224605',
      phoneNumberLink: 'tel:+543534224605',
      secondaryContactWhatsapp: '5493535668994',
    });

    expect(res.status).toBe(200);
    expect(res.body.settings.whatsappNumber).toBe('5493534224605');
    expect(res.body.settings.phoneNumberLink).toBe('tel:+543534224605');
  });

  it.each([
    ['enlace de teléfono con javascript:', { phoneNumberLink: 'javascript:alert(1)' }],
    ['enlace de teléfono con host externo', { phoneNumberLink: '//evil.example/x' }],
    ['WhatsApp con letras', { whatsappNumber: '54911abc' }],
    ['WhatsApp demasiado largo', { whatsappNumber: '1234567890123456' }],
    ['WhatsApp secundario inválido', { secondaryContactWhatsapp: 'no-es-un-numero' }],
    ['email inválido', { contactEmail: 'esto no es un mail' }],
    ['email con parámetros de mailto', { contactEmail: 'x?bcc=otro@dominio.com@playaysol.com.ar' }],
    ['email con ? en la parte local', { contactEmail: 'x?bcc=a@dominio.com' }],
    ['teléfono a mostrar con salto de línea', { phoneNumberDisplay: '3534\n224605' }],
    ['etiqueta demasiado larga', { secondaryContactLabel: 'x'.repeat(81) }],
  ])('rechaza %s y no guarda nada', async (_label, body) => {
    const before = await request(app).get('/api/settings/admin').set(adminAuth(token));
    const res = await save(body);

    expect(res.status).toBe(400);
    const after = await request(app).get('/api/settings/admin').set(adminAuth(token));
    expect(after.body).toEqual(before.body);
  });

  it('descarta los horarios con caracteres de control o demasiado largos', async () => {
    const res = await save({
      businessHours: [
        { day: 'Lunes\nviernes', hours: '9 a 18' },
        { day: 'x'.repeat(61), hours: '9 a 18' },
        { day: 'Sábados', hours: '9:00 - 13:00' },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body.settings.businessHours).toEqual([{ day: 'Sábados', hours: '9:00 - 13:00' }]);
  });

  it('un guardado parcial no pisa los horarios cargados', async () => {
    await save({ businessHours: [{ day: 'Lunes a Sábado', hours: '8:00 - 20:00' }] });
    const res = await save({ contactEmail: 'ventas@playaysol.com.ar' });

    expect(res.body.settings.businessHours).toEqual([{ day: 'Lunes a Sábado', hours: '8:00 - 20:00' }]);
  });

  it('no publica valores viejos con formato inválido que ya estuvieran en la base', async () => {
    const { default: Settings } = await import('../models/Settings.js');
    await Settings.create({ singletonKey: 'main', phoneNumberLink: 'javascript:alert(1)', whatsappNumber: 'abc', secondaryContactWhatsapp: '//x' });

    const res = await request(app).get('/api/settings/public');

    expect(res.body.phoneNumberLink).toBe('tel:+543534224605');
    expect(res.body.whatsappNumber).toBe('5493534224605');
    expect(res.body.secondaryContactWhatsapp).toBe('');
  });

  it('un WhatsApp secundario vacío lo quita', async () => {
    const res = await save({ secondaryContactWhatsapp: '' });
    expect(res.status).toBe(200);
    expect(res.body.settings.secondaryContactWhatsapp).toBe('');
  });
});
