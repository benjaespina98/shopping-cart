import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Projects', () => {
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

  it('requiere admin para crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/projects')
      .field('title', 'Piscina infinity')
      .field('location', 'Villa Nueva');

    expect(res.status).toBe(401);
  });

  it('rechaza crear un proyecto sin título o localidad', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Piscina infinity');

    expect(res.status).toBe(400);
  });

  // Regresión: un proyecto sin foto quedaba mostrando una caja vacía en el sitio público
  // en vez de una imagen — la galería de obras es justamente eso, fotos.
  it('rechaza crear un proyecto sin ninguna foto adjunta', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Piscina infinity')
      .field('location', 'Villa Nueva');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/foto/i);
  });
});
