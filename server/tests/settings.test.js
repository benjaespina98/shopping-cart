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
    // createAdminToken() crea el usuario con email admin@test.com / password Admin123!Segura
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('requiere estar autenticado', async () => {
    const res = await request(app)
      .put('/api/settings/users/me/password')
      .send({ currentPassword: 'Admin123!Segura', newPassword: 'NuevaClave123' });

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
      .send({ currentPassword: 'Admin123!Segura', newPassword: '123' });

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
      .send({ currentPassword: 'Admin123!Segura', newPassword: 'NuevaClave123' });

    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!Segura' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'NuevaClave123' });
    expect(newLogin.status).toBe(200);
  });

  it('rechaza una contraseña nueva de 11 caracteres y acepta una de 12', async () => {
    const corta = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Admin123!Segura', newPassword: 'a'.repeat(11) });
    expect(corta.status).toBe(400);
    expect(corta.body.message).toMatch(/al menos 12/);

    const ok = await request(app)
      .put('/api/settings/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Admin123!Segura', newPassword: 'a'.repeat(12) });
    expect(ok.status).toBe(200);
  });

  it('createUser rechaza una contraseña de 11 caracteres', async () => {
    const res = await request(app)
      .post('/api/settings/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Otro Admin', email: 'otro@test.com', password: 'a'.repeat(11) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/al menos 12/);
  });

  it('createUser acepta una de 12 y permite iniciar sesión', async () => {
    const res = await request(app)
      .post('/api/settings/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Otro Admin', email: 'otro@test.com', password: 'a'.repeat(12) });
    expect(res.status).toBe(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'otro@test.com', password: 'a'.repeat(12) });
    expect(login.status).toBe(200);
  });

  it('el modelo rechaza crear con menos de 12; una cuenta con hash viejo se puede seguir guardando', async () => {
    const { default: User } = await import('../models/User.js');

    await expect(User.create({ name: 'X', email: 'x@test.com', password: 'corta123' })).rejects.toThrow(
      /al menos 12/
    );

    // Cuenta anterior: el hash ya está guardado (60 caracteres) y se inserta por fuera del
    // modelo, como si hubiera sido creada con el mínimo viejo.
    const legacyHash = `$2a$12$${'a'.repeat(53)}`;
    await User.collection.insertOne({ name: 'Vieja', email: 'vieja@test.com', password: legacyHash, role: 'admin' });

    const user = await User.findOne({ email: 'vieja@test.com' });
    user.name = 'Vieja Renombrada';
    await expect(user.save()).resolves.toBeDefined();
    expect((await User.findOne({ email: 'vieja@test.com' })).password).toBe(legacyHash);
  });
});
