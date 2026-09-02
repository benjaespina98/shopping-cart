import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Manejo de errores y endpoints admin paginados', () => {
  let app;
  let mongod;
  let AuditLog;
  let token;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: AuditLog } = await import('../models/AuditLog.js'));
  });

  beforeEach(async () => {
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  // Regresión: un CastError de Mongoose (id con formato inválido) no estaba mapeado en el
  // error handler global y cualquier ruta /:id devolvía 500 en vez de 400.
  it('devuelve 400 (no 500) al pedir un producto con un id malformado', async () => {
    const res = await request(app).get('/api/products/no-es-un-object-id');
    expect(res.status).toBe(400);
  });

  it('devuelve 400 (no 500) al cambiar el estado de un pedido con un id malformado', async () => {
    const res = await request(app)
      .patch('/api/orders/no-es-un-object-id/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(400);
  });

  // Regresión: GET /api/orders no clampeaba page/limit como el resto de los endpoints
  // paginados. page=0 producía skip(-limit), que Mongo rechaza con una excepción -> 500.
  it('no rompe con page=0 en el listado de pedidos', async () => {
    const res = await request(app)
      .get('/api/orders?page=0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('clampea un limit fuera de rango en vez de romper', async () => {
    const res = await request(app)
      .get('/api/orders?limit=99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // Regresión ReDoS: la búsqueda de auditoría armaba `new RegExp(search)` sin escapar,
  // así que un patrón con backtracking catastrófico ("(a+)+$") podía colgar el proceso.
  // Si escapeRegExp() no se aplicara, este request colgaría (o tardaría muchísimo) en vez
  // de responder rápido con 0 resultados.
  it('trata caracteres especiales de regex en la búsqueda de auditoría como texto literal', async () => {
    await AuditLog.create({
      action: 'LOGIN_SUCCESS',
      entity: 'auth',
      message: 'Inicio de sesion exitoso',
    });

    const res = await request(app)
      .get('/api/logs?search=' + encodeURIComponent('(a+)+$'))
      .set('Authorization', `Bearer ${token}`)
      .timeout(5000);

    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
  });

  it('sigue encontrando resultados por texto normal en la búsqueda de auditoría', async () => {
    await AuditLog.create({
      action: 'LOGIN_SUCCESS',
      entity: 'auth',
      message: 'Inicio de sesion exitoso',
    });

    const res = await request(app)
      .get('/api/logs?search=sesion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.logs.length).toBe(1);
  });
});
