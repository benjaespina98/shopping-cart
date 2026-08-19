import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Infraestructura común para los tests de integración: un Mongo real en
// memoria (no un mock) para que las validaciones de schema, los índices
// únicos y las agregaciones se ejerciten tal cual corren en producción.
//
// Las env vars se fijan ANTES de importar app.js porque connectDB() /
// resolveMongoConnection() las leen recién al atender el primer request
// (conexión perezosa), así que alcanza con setearlas en beforeAll.
//
// IMPORTANTE — por qué se pisan TODAS las variables de conexión y no solo
// la de test: server/.env (uso local del desarrollador) trae su propio
// APP_ENV=development y MONGODB_URI_PREVIEW apuntando a un cluster real de
// Atlas. dotenv.config() no pisa una env var que ya esté seteada, pero sí
// completa las que falten — y getRuntimeEnv() mira APP_ENV *antes* que
// NODE_ENV, y resolveMongoConnection() prioriza MONGODB_URI_PREVIEW por
// sobre MONGODB_URI_TEST. La primera versión de este helper solo fijaba
// NODE_ENV y MONGODB_URI_TEST, así que en ambos puntos terminaba ganando el
// valor real del .env: los tests corrieron una vez contra el Mongo de
// Atlas de verdad (con deleteMany() en cada afterEach). Para que no vuelva
// a pasar, acá se fijan explícitamente TODAS las variables que
// resolveMongoConnection() podría leer, apuntando todas al Mongo en
// memoria — así no importa qué rama de entorno termine resolviendo.
export async function startTestApp() {
  const mongod = await MongoMemoryServer.create();
  const memoryUri = mongod.getUri('shopping-cart-test');

  process.env.NODE_ENV = 'test';
  process.env.APP_ENV = 'test';
  process.env.MONGODB_URI = memoryUri;
  process.env.MONGODB_URI_DEVELOPMENT = memoryUri;
  process.env.MONGODB_URI_PREVIEW = memoryUri;
  process.env.MONGODB_URI_TEST = memoryUri;
  process.env.MONGODB_URI_PRODUCTION = '';
  process.env.JWT_SECRET = 'test-secret-key-not-for-production';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.WHATSAPP_NUMBER = '5493534224605';
  process.env.STORE_NAME = 'Playa y Sol Test';
  process.env.CLIENT_URL = 'http://localhost:5173';

  const { default: app } = await import('../app.js');

  // app.js sólo conecta a Mongo de forma perezosa, dentro del middleware que
  // atiende /api/* — un helper de test que crea documentos directo por
  // modelo (sin pasar por una request HTTP primero) nunca dispara esa
  // conexión, y mongoose bufferea la operación hasta el timeout (10s) antes
  // de fallar. Conectamos acá mismo para que los tests no dependan del orden
  // en que hacen su primera llamada HTTP.
  const { connectDB } = await import('../config/db.js');
  await connectDB();

  // Cinturón y tirantes: si por cualquier motivo (una env var nueva, un
  // cambio futuro en resolveMongoConnection) la conexión terminara apuntando
  // a otro lado que no sea el Mongo en memoria de este test, hay que frenar
  // TODO antes de que un solo test corra un deleteMany() contra datos reales.
  const host = mongoose.connection.host || '';
  if (!/^(127\.0\.0\.1|localhost|::1)$/.test(host)) {
    await mongoose.disconnect();
    await mongod.stop();
    throw new Error(
      `Los tests intentaron conectar a un host que no es el Mongo en memoria (host: "${host}"). ` +
      'Se abortó para no tocar una base de datos real. Revisá resolveMongoConnection() y este helper.'
    );
  }

  return { app, mongod };
}

export async function clearDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function stopTestApp(mongod) {
  await mongoose.disconnect();
  await mongod.stop();
}

// Crea un admin y devuelve su JWT pasando por POST /api/auth/login de
// verdad. Sólo para auth.test.js: /api/auth/login tiene su propio rate
// limiter (5 intentos / 15 min, aparte del límite general de escritura) y
// un helper que llamara esto en cada beforeEach de una suite de varios
// tests lo agota a mitad de archivo — los tests siguientes reciben 429 en
// vez de un token y todo lo que dependía de él falla con 401 en cascada.
export async function createAdminAndLogin(request, app) {
  const { default: User } = await import('../models/User.js');
  const email = 'admin@test.com';
  const password = 'Admin123!';
  await User.create({ name: 'Admin Test', email, password, role: 'admin' });

  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

// Crea un admin y firma su JWT directamente (mismo secreto y formato que
// generateToken() en authController), sin pasar por el endpoint de login.
// Es lo que deben usar todos los demás tests: necesitan un token admin
// válido, no están probando el login en sí, y no tiene sentido que su
// cantidad de tests quede acotada por el rate limiter de /auth/login.
export async function createAdminToken() {
  const { default: User } = await import('../models/User.js');
  const jwt = (await import('jsonwebtoken')).default;

  const user = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
  });

  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
