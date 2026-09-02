import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { loadServerEnv, assertRequiredEnv } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import logRoutes from './routes/logRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

loadServerEnv();
assertRequiredEnv();

const app = express();

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const originPatternRegexList = allowedOrigins
  .filter((origin) => origin.includes('*'))
  .map((pattern) => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`, 'i');
  });

const exactOrigins = allowedOrigins.filter((origin) => !origin.includes('*'));

const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (exactOrigins.includes(normalizedOrigin)) return true;
  if (originPatternRegexList.some((regex) => regex.test(normalizedOrigin))) return true;

  // Allow any localhost/127.0.0.1 port in development to avoid Vite port drift issues.
  if (process.env.NODE_ENV !== 'production' && localDevOriginPattern.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

// Trust proxy if we are behind Vercel/proxies
app.set('trust proxy', 1);

app.use(helmet());
app.use(mongoSanitize());

// Limitador general.
//
// Estaba en 100 peticiones cada 15 minutos contando TODOS los métodos. Es muy poco
// para un sitio de lectura: recorrer inicio, servicios, proyectos y un par de páginas
// de la tienda ya consume varias decenas, y detrás de una conexión hogareña o de un
// móvil todos los visitantes comparten la misma IP pública. Al agotarse, el sitio
// empieza a responder 429 y se ve roto sin ningún motivo.
//
// Las lecturas públicas van con un techo alto, y las escrituras (que son las que
// conviene proteger) conservan un límite estricto aparte.
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones desde esta IP. Probá de nuevo en unos minutos.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones desde esta IP. Probá de nuevo en unos minutos.' },
});

const apiLimiter = (req, res, next) =>
  (req.method === 'GET' || req.method === 'HEAD' ? readLimiter : writeLimiter)(req, res, next);

// Login Rate Limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos.',
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
// Logging: usa 'combined' en producción
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/health') {
    next();
    return;
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/categories', categoryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  // Mostrar el error en consola para debugging
  console.error('Express error:', err);

  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  // Errores de carga de archivos (multer) → 400 con mensaje claro
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'La imagen es demasiado grande. El máximo permitido es 8 MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Se recibió un archivo en un campo inesperado.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Se superó la cantidad máxima de imágenes permitidas.';
    }
  } else if (err.name === 'CastError') {
    // ID con formato inválido (ej. un ObjectId malformado en /api/recurso/:id).
    // Sin este mapeo, Mongoose tira una excepción que caía al 500 genérico.
    statusCode = 400;
    message = 'Identificador inválido.';
  } else if (err.name === 'ValidationError') {
    // Falla de validación de un schema de Mongoose (ej. password corta, campo requerido).
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(' ') || message;
  } else if (err.code === 11000) {
    // Choque de índice único (ej. dos categorías con el mismo nombre en una carrera).
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Ya existe un registro con ese ${field}.` : 'El recurso ya existe.';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;