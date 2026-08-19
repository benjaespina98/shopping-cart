import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminAndLogin } from './helpers.js';

describe('Auth', () => {
  let app;
  let mongod;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('rechaza login con credenciales inexistentes', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@test.com', password: 'lo-que-sea' });

    expect(res.status).toBe(401);
  });

  it('rechaza login sin email o password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com' });
    expect(res.status).toBe(400);
  });

  it('loguea con credenciales válidas y devuelve un token utilizable', async () => {
    const token = await createAdminAndLogin(request, app);
    expect(token).toBeTruthy();

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('admin@test.com');
    expect(me.body.password).toBeUndefined();
  });

  it('rechaza /me sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rechaza /me con token inválido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer basura');
    expect(res.status).toBe(401);
  });
});
