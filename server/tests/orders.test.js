import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Orders', () => {
  let app;
  let mongod;
  let Product;
  let token;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: Product } = await import('../models/Product.js'));
  });

  beforeEach(async () => {
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  const makeProduct = (overrides = {}) =>
    Product.create({
      name: 'Cloro granulado',
      description: 'Bidón 5kg',
      price: 1000,
      stock: 10,
      category: 'Mantenimiento',
      active: true,
      ...overrides,
    });

  it('crea un pedido, descuenta stock y arma la URL de WhatsApp', async () => {
    const product = await makeProduct();

    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(res.body.order.total).toBe(3000);
    expect(res.body.whatsappUrl).toContain('https://wa.me/5493534224605');

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7);
  });

  it('fusiona líneas duplicadas del mismo producto antes de descontar stock', async () => {
    const product = await makeProduct({ stock: 5 });

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [
          { productId: product._id.toString(), quantity: 2 },
          { productId: product._id.toString(), quantity: 1 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.order.items).toHaveLength(1);
    expect(res.body.order.items[0].quantity).toBe(3);

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(2);
  });

  it('rechaza el pedido si no hay stock suficiente y no descuenta nada', async () => {
    const product = await makeProduct({ stock: 2 });

    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 5 }] });

    expect(res.status).toBe(400);

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(2);
  });

  it('hace rollback del stock ya descontado si otro producto del mismo pedido falla', async () => {
    const withStock = await makeProduct({ name: 'Con stock', stock: 5 });
    const withoutStock = await makeProduct({ name: 'Sin stock', stock: 1 });

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [
          { productId: withStock._id.toString(), quantity: 3 },
          { productId: withoutStock._id.toString(), quantity: 2 },
        ],
      });

    expect(res.status).toBe(400);

    // El primer producto se había descontado dentro del loop; el rollback
    // tiene que devolverlo a su stock original al fallar el segundo.
    const reverted = await Product.findById(withStock._id);
    expect(reverted.stock).toBe(5);
  });

  it('ignora productos inactivos al armar el pedido', async () => {
    const product = await makeProduct({ active: false });

    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    expect(res.status).toBe(400);
  });

  it('requiere admin para listar pedidos', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('acepta un cambio de estado válido', async () => {
    const product = await makeProduct();
    const created = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const res = await request(app)
      .patch(`/api/orders/${created.body.order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  // Regresión del fix: findByIdAndUpdate no corre los validadores del schema
  // por sí solo, así que sin la validación explícita este string quedaba
  // grabado tal cual y las métricas dejaban de reconocer el pedido.
  it('rechaza un estado fuera del enum en vez de guardarlo silenciosamente', async () => {
    const product = await makeProduct();
    const created = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const res = await request(app)
      .patch(`/api/orders/${created.body.order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'estado-inventado' });

    expect(res.status).toBe(400);

    const { default: Order } = await import('../models/Order.js');
    const stillPending = await Order.findById(created.body.order._id);
    expect(stillPending.status).toBe('whatsapp_sent');
  });
});
