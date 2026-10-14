import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import nodemailer from 'nodemailer';
import { startTestApp, stopTestApp, clearDb } from './helpers.js';

// Un server/.env local con credenciales reales de SMTP no debe hacer que los tests manden
// mails de verdad. Se simula ese .env ANTES de arrancar la app de test: startTestApp()
// tiene que vaciar estas variables (igual que hace con las URIs de Mongo) y el mailer
// no puede abrir ningún transporte.
const FAKE_DEV_ENV = {
  SMTP_HOST: 'smtp.invalid',
  SMTP_PORT: '465',
  SMTP_USER: 'usuario@invalid',
  SMTP_PASS: 'no-es-real',
  QUOTE_NOTIFY_EMAIL: 'destino@invalid',
  CLOUDINARY_CLOUD_NAME: 'cloud-invalid',
  CLOUDINARY_API_KEY: 'key-invalid',
  CLOUDINARY_API_SECRET: 'secret-invalid',
};

describe('Aislamiento de SMTP y Cloudinary en los tests', () => {
  let app;
  let mongod;
  let createTransport;

  beforeAll(async () => {
    Object.assign(process.env, FAKE_DEV_ENV);
    createTransport = vi.spyOn(nodemailer, 'createTransport');
    ({ app, mongod } = await startTestApp());
  });

  afterEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    createTransport.mockRestore();
    await stopTestApp(mongod);
  });

  it('startTestApp vacía las variables de SMTP y Cloudinary', () => {
    for (const key of Object.keys(FAKE_DEV_ENV)) {
      expect(process.env[key], key).toBe('');
    }
  });

  it('sendQuoteNotification no envía ni abre transporte', async () => {
    const { sendQuoteNotification } = await import('../utils/mailer.js');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const sent = await sendQuoteNotification({
      projectType: 'Piscina',
      name: 'Test',
      phone: '3534000000',
      email: 'test@example.com',
    });

    expect(sent).toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('crear una consulta por la API no abre ningún transporte SMTP', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await request(app).post('/api/quotes').send({
      projectType: 'Piscina nueva',
      name: 'Test',
      phone: '3534000000',
      email: 'test@example.com',
    });

    expect(res.status).toBe(201);
    expect(createTransport).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
