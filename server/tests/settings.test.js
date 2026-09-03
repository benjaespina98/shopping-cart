import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Settings — cambio de contraseña propia', () => {
  let app;
  let mongod;
  let token;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
  });

  beforeEach(async () => {
    // createAdminToken() crea el usuario con email admin@test.com / password Admin123!
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('requiere estar autenticado', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .send({ currentPassword: 'Admin123!', newPassword: 'NuevaClave123' });

    expect(res.status).toBe(401);
  });

  it('rechaza si falta la contraseña actual o la nueva', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'NuevaClave123' });

    expect(res.status).toBe(400);
  });

  it('rechaza una contraseña nueva demasiado corta', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Admin123!', newPassword: '123' });

    expect(res.status).toBe(400);
  });

  it('rechaza si la contraseña actual es incorrecta', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'no-es-esta', newPassword: 'NuevaClave123' });

    expect(res.status).toBe(401);
  });

  it('cambia la contraseña y permite loguearse con la nueva', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Admin123!', newPassword: 'NuevaClave123' });

    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'NuevaClave123' });
    expect(newLogin.status).toBe(200);
  });
});
