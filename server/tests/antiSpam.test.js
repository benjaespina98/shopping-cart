import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb } from './helpers.js';
import { MemoryStore, createFormLimiter } from '../middleware/formLimiter.js';
import { getHoneypotHits, resetHoneypotHits } from '../utils/antiSpam.js';
import { parseQuoteBody } from '../controllers/quoteController.js';
import { parseOrderBody } from '../controllers/orderController.js';

const quote = {
  projectType: 'Piscina nueva',
  name: 'Juana Pérez',
  phone: '353 400-0000',
  email: 'juana@test.com',
  location: 'Villa María',
  message: 'Quiero una piscina de 6x3',
};

describe('Anti-spam — formularios públicos', () => {
  let app;
  let mongod;
  let Product;
  let QuoteRequest;
  let Order;
  let warn;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
    ({ default: Product } = await import('../models/Product.js'));
    ({ default: QuoteRequest } = await import('../models/QuoteRequest.js'));
    ({ default: Order } = await import('../models/Order.js'));
  });

  beforeEach(() => {
    resetHoneypotHits();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    warn.mockRestore();
    await clearDb();
  });

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

  describe('honeypot', () => {
    it('presupuesto: responde como un éxito real pero no guarda nada', async () => {
      const real = await request(app).post('/api/quotes').send(quote);
      await clearDb();

      const trapped = await request(app).post('/api/quotes').send({ ...quote, website: 'http://spam.example' });

      expect(trapped.status).toBe(real.status);
      expect(Object.keys(trapped.body).sort()).toEqual(Object.keys(real.body).sort());
      expect(trapped.body.name).toBe(quote.name);
      expect(await QuoteRequest.countDocuments()).toBe(0);
    });

    it('presupuesto: no manda mail (no se invoca el mailer)', async () => {
      const mailer = await import('../utils/mailer.js');
      const spy = vi.spyOn(mailer, 'sendQuoteNotification');

      await request(app).post('/api/quotes').send({ ...quote, website: 'x' });

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('contacto: el honeypot también aplica con source "contact"', async () => {
      const res = await request(app).post('/api/quotes').send({ ...quote, source: 'contact', website: 'x' });
      expect(res.status).toBe(201);
      expect(await QuoteRequest.countDocuments()).toBe(0);
    });

    it('un campo vacío no activa el honeypot: la consulta se guarda', async () => {
      const res = await request(app).post('/api/quotes').send({ ...quote, website: '' });
      expect(res.status).toBe(201);
      expect(await QuoteRequest.countDocuments()).toBe(1);
      expect(getHoneypotHits('quotes')).toBe(0);
    });

    it('registra solo un contador, sin datos personales', async () => {
      await request(app).post('/api/quotes').send({ ...quote, website: 'http://spam.example' });
      await request(app).post('/api/quotes').send({ ...quote, website: 'http://spam.example' });

      expect(getHoneypotHits('quotes')).toBe(2);
      const logged = warn.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(logged).toMatch(/honeypot/);
      expect(logged).toMatch(/acumulado de este proceso: 2/);
      for (const personal of [quote.name, quote.email, quote.phone, 'spam.example']) {
        expect(logged).not.toContain(personal);
      }
    });

    it('pedido: responde como un éxito, sin descontar stock ni guardar el pedido', async () => {
      const product = await makeProduct();
      const items = [{ productId: product._id.toString(), quantity: 3 }];

      const real = await request(app).post('/api/orders').send({ items });
      await Product.updateOne({ _id: product._id }, { stock: 10 });
      await Order.deleteMany({});

      const trapped = await request(app).post('/api/orders').send({ items, website: 'x' });

      expect(trapped.status).toBe(real.status);
      expect(Object.keys(trapped.body).sort()).toEqual(Object.keys(real.body).sort());
      expect(Object.keys(trapped.body.order).sort()).toEqual(Object.keys(real.body.order).sort());
      expect(trapped.body.order.total).toBe(3000);
      expect(trapped.body.whatsappUrl).toContain('https://wa.me/');
      expect((await Product.findById(product._id)).stock).toBe(10);
      expect(await Order.countDocuments()).toBe(0);
      expect(getHoneypotHits('orders')).toBe(1);
    });

    it('pedido con honeypot y stock insuficiente responde igual que sin honeypot (400)', async () => {
      const product = await makeProduct({ stock: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: product._id.toString(), quantity: 5 }], website: 'x' });
      expect(res.status).toBe(400);
    });
  });

  describe('validación server-side de presupuestos', () => {
    const post = (body) => request(app).post('/api/quotes').send(body);

    it('recorta espacios de los campos', async () => {
      const res = await post({ ...quote, name: '  Juana  ', email: '  JUANA@Test.com ' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Juana');
      expect(res.body.email).toBe('juana@test.com');
    });

    it.each([
      ['projectType', 'Piscina\r\nBcc: victima@example.com'],
      ['email', 'a@test.com\r\nBcc: victima@example.com'],
      ['name', 'Juana\nPérez'],
      ['phone', '353400\r\n0000'],
      ['location', 'Villa\rMaría'],
    ])('rechaza CR/LF en %s (inyección de headers)', async (field, value) => {
      const res = await post({ ...quote, [field]: value });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/caracteres no permitidos|válid/);
      expect(await QuoteRequest.countDocuments()).toBe(0);
    });

    it('el mensaje sí puede tener saltos de línea', async () => {
      const res = await post({ ...quote, message: 'Línea 1\nLínea 2' });
      expect(res.status).toBe(201);
    });

    it.each(['sin-arroba', 'a@b', 'a b@test.com', 'a@@test.com', '<x>@test.com'])(
      'rechaza el email inválido %j',
      async (email) => {
        const res = await post({ ...quote, email });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Ingresá un email válido.');
      }
    );

    it('rechaza un teléfono con letras', async () => {
      const res = await post({ ...quote, phone: 'llamame' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Ingresá un teléfono válido.');
    });

    it('rechaza campos demasiado largos con un mensaje claro', async () => {
      const res = await post({ ...quote, message: 'a'.repeat(3001) });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/demasiado largo \(máximo 3000/);
    });

    it('rechaza valores que no son texto, sin filtrar detalles internos', async () => {
      const res = await post({ ...quote, name: { $gt: '' } });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('El nombre no es válido.');
      expect(res.body).not.toHaveProperty('stack');
    });

    it('mantiene el mensaje de campos requeridos', async () => {
      const res = await post({ ...quote, name: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/son requeridos/);
    });
  });

  describe('validación server-side de pedidos', () => {
    const post = (body) => request(app).post('/api/orders').send(body);

    it('rechaza nombre con CR/LF', async () => {
      const product = await makeProduct();
      const res = await post({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        customerName: 'Juana\r\nBcc: x@y.z',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/caracteres no permitidos/);
      expect((await Product.findById(product._id)).stock).toBe(10);
    });

    it('rechaza items que no es un array o cantidades no enteras', async () => {
      expect((await post({ items: 'abc' })).status).toBe(400);
      expect((await post({ items: [{ productId: 'x', quantity: 1.5 }] })).status).toBe(400);
      expect((await post({ items: [{ productId: 'x', quantity: -1 }] })).status).toBe(400);
      expect((await post({ items: [{ productId: 'x', quantity: 100000 }] })).status).toBe(400);
    });

    it('rechaza un carrito con más de 50 líneas', async () => {
      const items = Array.from({ length: 51 }, (_, i) => ({ productId: `p${i}`, quantity: 1 }));
      const res = await post({ items });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/máximo de 50/);
    });

    it('acepta nombre y teléfono válidos, recortados', async () => {
      const product = await makeProduct();
      const res = await post({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        customerName: '  Juana ',
        customerPhone: '353 400-0000',
      });
      expect(res.status).toBe(201);
      expect(res.body.order.customerName).toBe('Juana');
    });
  });

  describe('limiter de formularios (integración)', () => {
    it('POST /api/quotes devuelve 429 con Retry-After al superar el tope', async () => {
      const statuses = [];
      let last;
      for (let i = 0; i < 6; i += 1) {
        last = await request(app).post('/api/quotes').send(quote);
        statuses.push(last.status);
      }

      expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
      expect(statuses[5]).toBe(429);
      expect(Number(last.headers['retry-after'])).toBeGreaterThan(0);
      expect(last.body.message).toMatch(/demasiadas solicitudes/i);
      expect(last.body).not.toHaveProperty('stack');
    });

    it('POST /api/orders devuelve 429 después de 10 intentos', async () => {
      let last;
      for (let i = 0; i < 11; i += 1) {
        last = await request(app).post('/api/orders').send({ items: [] });
      }
      expect(last.status).toBe(429);
    });

    it('el limiter de presupuestos no consume el cupo de pedidos', async () => {
      for (let i = 0; i < 5; i += 1) await request(app).post('/api/quotes').send(quote);
      const res = await request(app).post('/api/orders').send({ items: [] });
      expect(res.status).toBe(400);
    });
  });
});

describe('createFormLimiter / MemoryStore (unitario)', () => {
  const run = async (limiter, ip = '1.1.1.1') => {
    const res = {
      headers: {},
      statusCode: 200,
      body: undefined,
      setHeader(k, v) {
        this.headers[k] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(b) {
        this.body = b;
      },
    };
    let passed = false;
    await limiter({ ip }, res, () => {
      passed = true;
    });
    return { res, passed };
  };

  it('deja pasar hasta "max" y bloquea el siguiente', async () => {
    const limiter = createFormLimiter({ max: 2 });
    expect((await run(limiter)).passed).toBe(true);
    expect((await run(limiter)).passed).toBe(true);
    const blocked = await run(limiter);
    expect(blocked.passed).toBe(false);
    expect(blocked.res.statusCode).toBe(429);
    expect(blocked.res.headers['Retry-After']).toBeDefined();
  });

  it('cuenta por IP por separado', async () => {
    const limiter = createFormLimiter({ max: 1 });
    expect((await run(limiter, '1.1.1.1')).passed).toBe(true);
    expect((await run(limiter, '2.2.2.2')).passed).toBe(true);
    expect((await run(limiter, '1.1.1.1')).passed).toBe(false);
  });

  it('el cupo se renueva al vencer la ventana', async () => {
    let now = 1_000_000;
    const store = new MemoryStore({ now: () => now });
    const limiter = createFormLimiter({ store, max: 1, windowMs: 60_000 });

    expect((await run(limiter)).passed).toBe(true);
    expect((await run(limiter)).passed).toBe(false);
    now += 60_001;
    expect((await run(limiter)).passed).toBe(true);
  });

  it('acepta un store reemplazable (interfaz hit(key, windowMs), incluso asíncrona)', async () => {
    const calls = [];
    const customStore = {
      hit: async (key, windowMs) => {
        calls.push([key, windowMs]);
        return { count: calls.length, resetAt: Date.now() + windowMs };
      },
    };
    const limiter = createFormLimiter({ store: customStore, max: 1, windowMs: 1000 });

    expect((await run(limiter, '9.9.9.9')).passed).toBe(true);
    expect((await run(limiter, '9.9.9.9')).passed).toBe(false);
    expect(calls).toEqual([
      ['9.9.9.9', 1000],
      ['9.9.9.9', 1000],
    ]);
  });

  it('si el store falla, deja pasar el request en vez de perder consultas', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const limiter = createFormLimiter({
      store: {
        hit: async () => {
          throw new Error('redis caído');
        },
      },
      max: 1,
    });
    expect((await run(limiter)).passed).toBe(true);
    error.mockRestore();
  });

  it('el MemoryStore descarta ventanas vencidas para no crecer sin límite', () => {
    let now = 0;
    const store = new MemoryStore({ now: () => now, maxKeys: 2 });
    store.hit('a', 10);
    store.hit('b', 10);
    now = 100;
    store.hit('c', 10);
    expect(store.entries.size).toBe(1);
  });

  it('exige un max válido', () => {
    expect(() => createFormLimiter({ max: 0 })).toThrow();
    expect(() => createFormLimiter({})).toThrow();
  });
});

describe('parseQuoteBody / parseOrderBody (unitario)', () => {
  it('parseQuoteBody normaliza y devuelve source válido', () => {
    const { data } = parseQuoteBody({ ...quote, source: 'otra-cosa' });
    expect(data.source).toBe('quote');
    expect(parseQuoteBody({ ...quote, source: 'contact' }).data.source).toBe('contact');
  });

  it('parseQuoteBody tolera un body vacío o no objeto', () => {
    expect(parseQuoteBody(undefined).error).toMatch(/requeridos/);
    expect(parseQuoteBody('texto').error).toMatch(/requeridos/);
  });

  it('parseOrderBody exige un array de items', () => {
    expect(parseOrderBody({}).error).toMatch(/No hay productos/);
    expect(parseOrderBody({ items: [] }).error).toMatch(/No hay productos/);
  });
});
