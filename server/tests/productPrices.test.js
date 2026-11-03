import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken, adminAuth } from './helpers.js';

describe('PATCH /api/products/prices — editor masivo de precios', () => {
  let app;
  let mongod;
  let Product;
  let AuditLog;
  let token;
  let a;
  let b;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: Product } = await import('../models/Product.js'));
    ({ default: AuditLog } = await import('../models/AuditLog.js'));
  });

  beforeEach(async () => {
    token = await createAdminToken();
    [a, b] = await Product.create([
      { name: 'Cloro', price: 1000, stock: 5, category: 'Mantenimiento' },
      { name: 'Filtro', price: 2500, stock: 2, category: 'Mantenimiento' },
    ]);
  });

  afterEach(clearDb);
  afterAll(async () => { await stopTestApp(mongod); });

  const send = (body, auth = adminAuth(token)) => request(app).patch('/api/products/prices').set(auth).send(body);

  it('actualiza los precios enviados y deja registro de auditoría', async () => {
    const res = await send({ updates: [{ id: String(a._id), price: 1100 }, { id: String(b._id), price: 2750.5 }] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 2, unchanged: 0, skipped: 0 });
    expect((await Product.findById(a._id)).price).toBe(1100);
    expect((await Product.findById(b._id)).price).toBe(2750.5);

    const log = await AuditLog.findOne({ action: 'PRODUCT_PRICES_UPDATED' }).lean();
    expect(log.meta.count).toBe(2);
    expect(log.meta.changes[0]).toMatchObject({ name: 'Cloro', from: 1000, to: 1100 });
  });

  it('no escribe las filas cuyo precio no cambió', async () => {
    const res = await send({ updates: [{ id: String(a._id), price: 1000 }, { id: String(b._id), price: 3000 }] });

    expect(res.body).toEqual({ updated: 1, unchanged: 1, skipped: 0 });
  });

  it('solo toca el precio: stock, nombre y el resto de los campos no se pueden cambiar por acá', async () => {
    await send({ updates: [{ id: String(a._id), price: 1200, stock: 999, name: 'Hack', active: false }] });

    const product = await Product.findById(a._id);
    expect(product.price).toBe(1200);
    expect(product.stock).toBe(5);
    expect(product.name).toBe('Cloro');
    expect(product.active).toBe(true);
  });

  it('redondea a dos decimales', async () => {
    await send({ updates: [{ id: String(a._id), price: 1000.456 }] });
    expect((await Product.findById(a._id)).price).toBe(1000.46);
  });

  it.each([
    ['precio negativo', { price: -1 }],
    ['precio como texto', { price: '1500' }],
    ['precio no finito', { price: null }],
    ['precio desmedido', { price: 1e12 }],
  ])('rechaza %s y no guarda ninguna fila (todo o nada)', async (_label, bad) => {
    const res = await send({ updates: [{ id: String(a._id), price: 1500 }, { id: String(b._id), ...bad }] });

    expect(res.status).toBe(400);
    expect((await Product.findById(a._id)).price).toBe(1000);
    expect((await Product.findById(b._id)).price).toBe(2500);
  });

  it('rechaza ids inválidos, repetidos o inexistentes', async () => {
    expect((await send({ updates: [{ id: 'no-es-un-id', price: 10 }] })).status).toBe(400);
    expect((await send({ updates: [{ id: { $ne: null }, price: 10 }] })).status).toBe(400);
    expect((await send({ updates: [{ id: String(a._id), price: 10 }, { id: String(a._id), price: 20 }] })).status).toBe(400);

    const ghost = '64b64b64b64b64b64b64b64b';
    const res = await send({ updates: [{ id: String(a._id), price: 10 }, { id: ghost, price: 20 }] });
    expect(res.status).toBe(404);
    expect((await Product.findById(a._id)).price).toBe(1000);
  });

  it('rechaza listas vacías, que no son lista o con demasiadas filas', async () => {
    expect((await send({ updates: [] })).status).toBe(400);
    expect((await send({ updates: 'x' })).status).toBe(400);
    expect((await send({})).status).toBe(400);
    const many = Array.from({ length: 201 }, () => ({ id: String(a._id), price: 1 }));
    expect((await send({ updates: many })).status).toBe(400);
  });

  it('registra todos los cambios del lote en la auditoría, no solo los primeros', async () => {
    const many = await Product.create(
      Array.from({ length: 60 }, (_, i) => ({ name: `P${i}`, price: 100, stock: 1, category: 'Mantenimiento' }))
    );
    await send({ updates: many.map((p) => ({ id: String(p._id), price: 150 })) });

    const log = await AuditLog.findOne({ action: 'PRODUCT_PRICES_UPDATED' }).lean();
    expect(log.meta.count).toBe(60);
    expect(log.meta.changes).toHaveLength(60);
  });

  it('exige además el header anti-CSRF (una cookie sola no alcanza)', async () => {
    const res = await request(app).patch('/api/products/prices')
      .set({ Cookie: adminAuth(token).Cookie })
      .send({ updates: [{ id: String(a._id), price: 5 }] });

    expect(res.status).toBe(403);
    expect((await Product.findById(a._id)).price).toBe(1000);
  });

  it('requiere sesión de admin', async () => {
    const res = await request(app).patch('/api/products/prices').send({ updates: [{ id: String(a._id), price: 5 }] });
    expect(res.status).toBe(401);
    expect((await Product.findById(a._id)).price).toBe(1000);
  });
});
