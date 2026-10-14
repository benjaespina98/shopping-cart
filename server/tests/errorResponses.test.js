import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { startTestApp, stopTestApp } from './helpers.js';

// El handler global (server/app.js) no debe filtrar detalles internos: en 5xx devuelve
// un mensaje genérico y el stack no viaja nunca; los 4xx de validación conservan su mensaje.
describe('Handler global de errores — sin fuga de detalles internos', () => {
  let app;
  let mongod;
  let consoleError;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleError = undefined;
  });

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('un error interno inesperado devuelve 500 con mensaje genérico y sin stack', async () => {
    const detail = 'ECONNRESET cluster0-shard-00-01.example.mongodb.net:27017';
    vi.spyOn(mongoose.Query.prototype, 'exec').mockRejectedValue(new Error(detail));
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Error interno del servidor/);
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain(detail);
    // El detalle sí queda en el log del servidor.
    expect(consoleError).toHaveBeenCalled();
  });

  it('un 500 lanzado a propósito por un controller tampoco expone su mensaje', async () => {
    const previous = process.env.WHATSAPP_NUMBER;
    process.env.WHATSAPP_NUMBER = '';
    vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const res = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: '000000000000000000000000', quantity: 1 }], customerName: 'Test' });

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Error interno del servidor/);
      expect(res.body.message).not.toMatch(/WhatsApp/i);
      expect(res.body).not.toHaveProperty('stack');
    } finally {
      process.env.WHATSAPP_NUMBER = previous;
    }
  });

  it('los errores 4xx de validación conservan su mensaje y no traen stack', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/products/no-es-un-object-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Identificador inválido.');
    expect(res.body).not.toHaveProperty('stack');
  });

  it('una ruta inexistente responde 404 sin stack', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).not.toHaveProperty('stack');
  });
});
