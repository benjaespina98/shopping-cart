import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Products', () => {
  let app;
  let mongod;
  let Product;
  let Category;
  let token;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: Product } = await import('../models/Product.js'));
    ({ default: Category } = await import('../models/Category.js'));
  });

  beforeEach(async () => {
    token = await createAdminToken();
    await Category.create({ name: 'Mantenimiento', order: 0 });
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('solo lista productos activos en el endpoint público', async () => {
    await Product.create([
      { name: 'Activo', price: 100, stock: 5, category: 'Mantenimiento', active: true },
      { name: 'Inactivo', price: 100, stock: 5, category: 'Mantenimiento', active: false },
    ]);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.products[0].name).toBe('Activo');
  });

  it('devuelve 404 al pedir un producto inactivo por id', async () => {
    const product = await Product.create({
      name: 'Oculto', price: 100, stock: 5, category: 'Mantenimiento', active: false,
    });
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(404);
  });

  it('crea un producto validando la categoría contra la colección', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Cloro')
      .field('price', '500')
      .field('stock', '10')
      .field('category', 'Mantenimiento');

    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Mantenimiento');
  });

  it('rechaza crear un producto con una categoría inexistente', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Cloro')
      .field('price', '500')
      .field('stock', '10')
      .field('category', 'Categoría Fantasma');

    expect(res.status).toBe(400);
  });

  it('requiere admin para crear productos', async () => {
    const res = await request(app)
      .post('/api/products')
      .field('name', 'Cloro')
      .field('price', '500')
      .field('stock', '10')
      .field('category', 'Mantenimiento');

    expect(res.status).toBe(401);
  });

  it('actualiza el stock con un valor válido', async () => {
    const product = await Product.create({
      name: 'Filtro', price: 200, stock: 3, category: 'Mantenimiento', active: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product._id}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 20 });

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(20);
  });

  // Regresión del fix: antes se guardaba Number(stock) tal cual, y un valor
  // negativo o no numérico llegaba a la base sin pasar por min: 0.
  it('rechaza un stock negativo en vez de guardarlo', async () => {
    const product = await Product.create({
      name: 'Filtro', price: 200, stock: 3, category: 'Mantenimiento', active: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product._id}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: -5 });

    expect(res.status).toBe(400);

    const unchanged = await Product.findById(product._id);
    expect(unchanged.stock).toBe(3);
  });

  it('rechaza un stock no numérico', async () => {
    const product = await Product.create({
      name: 'Filtro', price: 200, stock: 3, category: 'Mantenimiento', active: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product._id}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 'no-es-un-numero' });

    expect(res.status).toBe(400);
  });
});
