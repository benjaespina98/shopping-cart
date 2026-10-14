import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { startTestApp, stopTestApp, clearDb, createAdminToken, adminAuth, sessionTokenFrom } from './helpers.js';
import { SESSION_COOKIE } from '../config/session.js';
import { parseCookies } from '../utils/cookies.js';

const CREDENTIALS = { email: 'admin@test.com', password: 'Admin123!Segura' };

describe('Autenticación por cookie httpOnly', () => {
  let app;
  let mongod;

  beforeAll(async () => {
    ({ app, mongod } = await startTestApp());
  });

  afterEach(async () => {
    delete process.env.VERCEL_ENV;
    await clearDb();
  });

  afterAll(async () => {
    await stopTestApp(mongod);
  });

  // createAdminToken() crea admin@test.com / Admin123!Segura y devuelve su JWT.
  const login = async () => {
    await createAdminToken();
    return request(app).post('/api/auth/login').send(CREDENTIALS);
  };

  const setCookieOf = (res) => (res.headers['set-cookie'] || []).find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  describe('login', () => {
    // /api/auth/login tiene un limiter de 5 intentos cada 15 min: este describe usa 3 logins.
    it('setea la cookie con HttpOnly, SameSite=Strict, Path=/api y Max-Age = expiración del JWT, sin token en el cuerpo', async () => {
      const res = await login();
      expect(res.status).toBe(200);

      const cookie = setCookieOf(res);
      expect(cookie).toBeDefined();
      expect(cookie).toMatch(/;\s*HttpOnly/i);
      expect(cookie).toMatch(/;\s*SameSite=Strict/i);
      expect(cookie).toMatch(/;\s*Path=\/api(;|$)/i);
      // JWT_EXPIRES_IN = '1h' en el entorno de test (helpers.js) → 3600 segundos.
      expect(cookie).toMatch(/;\s*Max-Age=3600(;|$)/i);
      // Sin HTTPS en desarrollo/test el navegador descartaría una cookie Secure.
      expect(cookie).not.toMatch(/;\s*Secure/i);

      expect(res.body.token).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain(sessionTokenFrom(res));
      expect(res.body.email).toBe('admin@test.com');
      expect(res.headers['cache-control']).toMatch(/no-store/);
    });

    it.each(['production', 'preview'])('incluye Secure cuando el entorno es %s', async (env) => {
      process.env.VERCEL_ENV = env;
      const res = await login();
      expect(setCookieOf(res)).toMatch(/;\s*Secure/i);
    });

  });

  describe('rutas protegidas', () => {
    it('sin cookie responde 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('con la cookie válida responde 200', async () => {
      const token = await createAdminToken();
      const me = await request(app).get('/api/auth/me').set(adminAuth(token));
      expect(me.status).toBe(200);
      expect(me.body.email).toBe('admin@test.com');

      const quotes = await request(app).get('/api/quotes').set(adminAuth(token));
      expect(quotes.status).toBe(200);
    });

    it('un GET autenticado no necesita el header CSRF', async () => {
      const token = await createAdminToken();
      const res = await request(app).get('/api/auth/me').set('Cookie', `${SESSION_COOKIE}=${token}`);
      expect(res.status).toBe(200);
    });

    it('el header Authorization: Bearer ya no autentica', async () => {
      const token = await createAdminToken();
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    });

    it('una cookie con un JWT inválido o manipulado responde 401', async () => {
      const token = await createAdminToken();
      const tampered = `${token.slice(0, -3)}abc`;

      for (const value of ['basura', tampered]) {
        const res = await request(app).get('/api/auth/me').set('Cookie', `${SESSION_COOKIE}=${value}`);
        expect(res.status).toBe(401);
      }
    });
  });

  describe('logout', () => {
    it('limpia la cookie con los mismos atributos', async () => {
      const token = await createAdminToken();
      const res = await request(app).post('/api/auth/logout').set(adminAuth(token));

      expect(res.status).toBe(200);
      const cookie = setCookieOf(res);
      expect(cookie).toBeDefined();
      expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=;`));
      expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/i);
      expect(cookie).toMatch(/;\s*Path=\/api/i);
      expect(cookie).toMatch(/;\s*HttpOnly/i);
    });

    it('es idempotente: funciona aunque no haya sesión', async () => {
      const res = await request(app).post('/api/auth/logout').set('X-Requested-With', 'XMLHttpRequest');
      expect(res.status).toBe(200);
    });

    it('exige el header CSRF', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(403);
    });
  });

  describe('CSRF', () => {
    const createCategory = (headers) =>
      request(app).post('/api/categories').set(headers).send({ name: 'Nueva categoría' });

    it('un POST autenticado sin X-Requested-With responde 403 y no ejecuta la acción', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ Cookie: `${SESSION_COOKIE}=${token}` });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Solicitud no permitida');
      expect(res.body).not.toHaveProperty('stack');

      const list = await request(app).get('/api/categories');
      expect(JSON.stringify(list.body)).not.toContain('Nueva categoría');
    });

    it('con el header correcto el POST autenticado funciona', async () => {
      const token = await createAdminToken();
      const res = await createCategory(adminAuth(token));
      expect(res.status).toBe(201);
    });

    it('un header con otro valor tampoco alcanza', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ Cookie: `${SESSION_COOKIE}=${token}`, 'X-Requested-With': 'fetch' });
      expect(res.status).toBe(403);
    });

    it('un Origin ajeno responde 403 aunque el header y la cookie sean válidos', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ ...adminAuth(token), Origin: 'https://sitio-malicioso.example' });
      expect(res.status).toBe(403);
    });

    it('Origin "null" (iframe sandbox) responde 403', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ ...adminAuth(token), Origin: 'null' });
      expect(res.status).toBe(403);
    });

    it('un Referer ajeno (sin Origin) responde 403', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ ...adminAuth(token), Referer: 'https://sitio-malicioso.example/pagina' });
      expect(res.status).toBe(403);
    });

    it('un Origin de la allowlist (CLIENT_URL) pasa', async () => {
      const token = await createAdminToken();
      const res = await createCategory({ ...adminAuth(token), Origin: 'http://localhost:5173' });
      expect(res.status).toBe(201);
    });

    it('el mismo host que sirve la API pasa (previews de Vercel)', async () => {
      const token = await createAdminToken();
      const res = await createCategory({
        ...adminAuth(token),
        Host: 'mi-preview-abc123.vercel.app',
        Origin: 'https://mi-preview-abc123.vercel.app',
      });
      expect(res.status).toBe(201);
    });

    it('sin Origin ni Referer (cliente no-navegador) pasa si trae el header', async () => {
      const token = await createAdminToken();
      const res = await createCategory(adminAuth(token));
      expect(res.status).toBe(201);
    });

    it('PUT, PATCH y DELETE también exigen el header', async () => {
      const token = await createAdminToken();
      const id = '000000000000000000000000';
      const cookieOnly = { Cookie: `${SESSION_COOKIE}=${token}` };

      expect((await request(app).put(`/api/categories/${id}`).set(cookieOnly).send({ name: 'x' })).status).toBe(403);
      expect((await request(app).patch(`/api/quotes/${id}/status`).set(cookieOnly).send({ status: 'closed' })).status).toBe(403);
      expect((await request(app).delete(`/api/categories/${id}`).set(cookieOnly)).status).toBe(403);
    });

    it('no afecta a las rutas públicas: un presupuesto se envía sin el header', async () => {
      const res = await request(app).post('/api/quotes').send({
        projectType: 'Piscina nueva',
        name: 'Juana',
        phone: '3534000000',
        email: 'juana@test.com',
      });
      expect(res.status).toBe(201);
    });
  });

  describe('CORS con credenciales', () => {
    it('refleja el origen permitido (no "*") y habilita credenciales', async () => {
      const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('un origen ajeno no recibe Access-Control-Allow-Origin', async () => {
      const res = await request(app).get('/api/health').set('Origin', 'https://sitio-malicioso.example');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});

describe('parseCookies', () => {
  it('lee varias cookies y decodifica valores', () => {
    expect(parseCookies('a=1; b=hola%20mundo;  c="x"')).toEqual({ a: '1', b: 'hola mundo', c: 'x' });
  });

  it('la primera aparición de una cookie duplicada gana', () => {
    expect(parseCookies('t=legitimo; t=pisado').t).toBe('legitimo');
  });

  it('ignora entradas sin nombre o sin "="', () => {
    expect(parseCookies('=sin-nombre; basura; ok=1')).toEqual({ ok: '1' });
  });

  it('tolera header ausente, no-string o desmedido', () => {
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies(42)).toEqual({});
    expect(parseCookies('a=' + 'x'.repeat(9000))).toEqual({});
  });

  it('no explota con percent-encoding inválido', () => {
    expect(parseCookies('a=%E0%A4%A').a).toBe('%E0%A4%A');
  });
});
