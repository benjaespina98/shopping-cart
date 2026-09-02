import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

describe('Categories', () => {
  let app;
  let mongod;
  let Product;
  let token;

  let Category;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: Product } = await import('../models/Product.js'));
    ({ default: Category } = await import('../models/Category.js'));
    // autoIndex está desactivado fuera de development (ver config/db.js) — en el Mongo en
    // memoria de los tests eso significa que el índice único con collation case-insensitive
    // del modelo (ver models/Category.js) no se crea solo. Se sincroniza acá a propósito
    // para poder probar de verdad que ese índice es lo que corta la carrera de nombres
    // duplicados, no solo el chequeo a nivel app (que una carrera real puede esquivar).
    await Category.syncIndexes();
  });

  beforeEach(async () => {
    token = await createAdminToken();
  });

  afterEach(clearDb);

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  it('crea una categoría', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bombas y filtros' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bombas y filtros');
  });

  it('rechaza crear una categoría duplicada (case-insensitive)', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Limpieza' });

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'limpieza' });

    expect(res.status).toBe(409);
  });

  // Regresión del fix: el chequeo previo del controller ("¿ya existe?") es a nivel app, así
  // que dos requests concurrentes con distinta capitalización pueden pasarlo ambos antes de
  // que ninguno haya insertado todavía. La defensa real es el índice único con collation
  // case-insensitive del modelo — sin syncIndexes() en el beforeAll de arriba, este test
  // fallaría (ambas quedarían creadas) aunque el controller esté "bien".
  it('el índice único evita que una carrera cree dos categorías que solo difieren en mayúsculas', async () => {
    const [first, second] = await Promise.all([
      request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Repuestos' }),
      request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'REPUESTOS' }),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);

    const count = await Category.countDocuments({ name: /^repuestos$/i });
    expect(count).toBe(1);
  });

  it('renombrar una categoría propaga el cambio a los productos que la usan', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Seguridad' });

    await Product.create({
      name: 'Cerco', price: 5000, stock: 2, category: 'Seguridad', active: true,
    });

    const res = await request(app)
      .put(`/api/categories/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Seguridad y cercos' });

    expect(res.status).toBe(200);

    const product = await Product.findOne({ name: 'Cerco' });
    expect(product.category).toBe('Seguridad y cercos');
  });

  it('bloquea el borrado de una categoría en uso', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Climatización' });

    await Product.create({
      name: 'Bomba de calor', price: 500000, stock: 1, category: 'Climatización', active: true,
    });

    const res = await request(app)
      .delete(`/api/categories/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('permite borrar una categoría sin productos', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin uso' });

    const res = await request(app)
      .delete(`/api/categories/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('siembra categorías a partir de los productos existentes la primera vez', async () => {
    await Product.create({
      name: 'Producto suelto', price: 100, stock: 1, category: 'General', active: true,
    });

    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.some((c) => c.name === 'General')).toBe(true);
  });
});
