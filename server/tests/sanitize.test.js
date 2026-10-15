import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken } from './helpers.js';

// express-mongo-sanitize tiene que correr DESPUÉS de express.json(): antes de eso req.body
// todavía no existe y el cuerpo llegaba sin limpiar.
describe('mongoSanitize: orden y efecto', () => {
  let app;
  let mongod;
  let User;
  let QuoteRequest;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: User } = await import('../models/User.js'));
    ({ default: QuoteRequest } = await import('../models/QuoteRequest.js'));
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await clearDb();
  });
  afterAll(async () => {
    await stopTestApp(mongod);
  });

  const layerIndex = (name) => app._router.stack.findIndex((l) => l.name === name);

  it('mongoSanitize está montado después de los parsers de body', () => {
    const json = layerIndex('jsonParser');
    const urlencoded = layerIndex('urlencodedParser');
    const sanitize = app._router.stack.findIndex((l) => /sanitize/i.test(l.handle?.toString?.() || ''));
    expect(json).toBeGreaterThan(-1);
    expect(urlencoded).toBeGreaterThan(-1);
    expect(sanitize).toBeGreaterThan(Math.max(json, urlencoded));
  });

  it('el login no consulta la base con un operador $gt en el email', async () => {
    await createAdminToken();
    const findOne = vi.spyOn(User, 'findOne');

    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":{"$gt":""},"password":{"$gt":""}}');

    expect(res.status).toBe(400);
    const seen = JSON.stringify(findOne.mock.calls);
    expect(seen).not.toContain('$gt');
  });

  it('un login normal sigue funcionando', async () => {
    await createAdminToken();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!Segura' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@test.com');
  });

  it('las claves "$" y con "." no llegan al controller de /api/quotes', async () => {
    const create = vi.spyOn(QuoteRequest, 'create');
    const res = await request(app)
      .post('/api/quotes')
      .set('Content-Type', 'application/json')
      .send(
        '{"projectType":"Piscina","name":"Juana","phone":"3534000000","email":"j@test.com","message":"hola","$where":"1","a.b":"x"}'
      );

    expect(res.status).toBe(201);
    const payload = JSON.stringify(create.mock.calls);
    expect(payload).not.toContain('$where');
    expect(payload).not.toContain('a.b');
  });

  it('un operador anidado en un campo de /api/quotes se rechaza con 400', async () => {
    const res = await request(app)
      .post('/api/quotes')
      .set('Content-Type', 'application/json')
      .send('{"projectType":"Piscina","name":{"$gt":""},"phone":"3534000000","email":"j@test.com"}');
    expect(res.status).toBe(400);
    expect(await QuoteRequest.countDocuments()).toBe(0);
  });

  it('los cuerpos urlencoded también se sanean', async () => {
    const create = vi.spyOn(QuoteRequest, 'create');
    const res = await request(app)
      .post('/api/quotes')
      .type('form')
      .send('projectType=Piscina&name=Juana&phone=3534000000&email=j%40test.com&%24where=1');
    expect(res.status).toBe(201);
    expect(JSON.stringify(create.mock.calls)).not.toContain('$where');
  });
});
