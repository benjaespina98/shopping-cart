import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Quotes', () => {
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

  const payload = {
    projectType: 'Piscina nueva',
    name: 'Juana Pérez',
    phone: '3534000000',
    email: 'juana@test.com',
    location: 'Villa María',
    message: 'Quiero una piscina de 6x3',
  };

  it('crea una solicitud pública sin requerir login', async () => {
    const res = await request(app).post('/api/quotes').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('new');
    expect(res.body.source).toBe('quote');
  });

  it('rechaza la solicitud si falta un campo requerido', async () => {
    const res = await request(app).post('/api/quotes').send({ ...payload, email: undefined });
    expect(res.status).toBe(400);
  });

  it('normaliza source a "contact" solo cuando se pide explícitamente', async () => {
    const res = await request(app).post('/api/quotes').send({ ...payload, source: 'contact' });
    expect(res.body.source).toBe('contact');

    const otro = await request(app).post('/api/quotes').send({ ...payload, source: 'lo-que-sea' });
    expect(otro.body.source).toBe('quote');
  });

  it('requiere admin para listar solicitudes', async () => {
    const res = await request(app).get('/api/quotes');
    expect(res.status).toBe(401);
  });

  it('acepta un cambio de estado válido', async () => {
    const created = await request(app).post('/api/quotes').send(payload);
    const res = await request(app)
      .patch(`/api/quotes/${created.body._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'contacted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('contacted');
  });

  // Mismo fix que en pedidos: sin la validación explícita, findByIdAndUpdate
  // graba cualquier string en `status` sin pasar por el enum del schema.
  it('rechaza un estado fuera del enum', async () => {
    const created = await request(app).post('/api/quotes').send(payload);
    const res = await request(app)
      .patch(`/api/quotes/${created.body._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'no-existe' });

    expect(res.status).toBe(400);

    const { default: QuoteRequest } = await import('../models/QuoteRequest.js');
    const stillNew = await QuoteRequest.findById(created.body._id);
    expect(stillNew.status).toBe('new');
  });
});
