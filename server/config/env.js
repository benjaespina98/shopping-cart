import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MIN_PASSWORD_LENGTH, isValidEmail } from '../utils/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadServerEnv = () => {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
};

const normalizeEnvLabel = (value) => String(value || '').trim().toLowerCase();

export const getRuntimeEnv = () => {
  const vercelEnv = normalizeEnvLabel(process.env.VERCEL_ENV);
  if (vercelEnv === 'production' || vercelEnv === 'preview' || vercelEnv === 'development') {
    return vercelEnv;
  }

  const appEnv = normalizeEnvLabel(process.env.APP_ENV);
  if (appEnv === 'production' || appEnv === 'preview' || appEnv === 'testing' || appEnv === 'development') {
    return appEnv;
  }

  const nodeEnv = normalizeEnvLabel(process.env.NODE_ENV);
  if (nodeEnv === 'production' || nodeEnv === 'test') return nodeEnv;

  return 'development';
};

// JWT_SECRET y las credenciales de Cloudinary se leen directamente de process.env en cada
// controller que los usa (authController, config/cloudinary.js), sin ningún chequeo previo.
// Si faltan, el servidor arranca igual y recién se entera en el primer login o la primera
// subida de imagen — con un 401/500 opaco que no dice qué variable falta. Se valida solo en
// producción/preview (deploys reales) para no romper un desarrollo local que todavía no
// configuró Cloudinary, o los tests, que no usan estas integraciones.
const REQUIRED_IN_DEPLOY = ['JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

export const assertRequiredEnv = () => {
  const runtimeEnv = getRuntimeEnv();
  if (runtimeEnv !== 'production' && runtimeEnv !== 'preview') return;

  const missing = REQUIRED_IN_DEPLOY.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas en ${runtimeEnv}: ${missing.join(', ')}`);
  }
};

export const resolveMongoConnection = () => {
  const runtimeEnv = getRuntimeEnv();

  const productionUri = process.env.MONGODB_URI_PRODUCTION || '';
  const previewUri = process.env.MONGODB_URI_PREVIEW || process.env.MONGODB_URI_TEST || '';
  const developmentUri = process.env.MONGODB_URI_DEVELOPMENT || process.env.MONGODB_URI || '';
  const legacyUri = process.env.MONGODB_URI || '';

  if (runtimeEnv === 'production') {
    const uri = productionUri || legacyUri;
    if (!uri) {
      throw new Error('No se encontro MONGODB_URI_PRODUCTION para entorno productivo');
    }
    return { uri, label: 'production' };
  }

  if (runtimeEnv === 'preview' || runtimeEnv === 'testing' || runtimeEnv === 'test') {
    if (!previewUri) {
      throw new Error(
        'No se encontro MONGODB_URI_PREVIEW/MONGODB_URI_TEST para entorno de testing/preview. Se bloquea conexion para proteger produccion.'
      );
    }
    return { uri: previewUri, label: runtimeEnv };
  }

  const uri = developmentUri || previewUri || legacyUri;
  if (!uri) {
    throw new Error('No se encontro URI de MongoDB para entorno de desarrollo');
  }

  return { uri, label: 'development' };
};

// Credenciales del admin que crea el seed. No hay valores por defecto: una contraseña
// literal en el código queda en el repo y en el historial, y se terminaría usando en
// una base real si alguien corre el seed sin definir la variable. Se recibe `env` para
// poder probarla sin tocar process.env ni conectar a ninguna base.
export const MIN_ADMIN_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH;

export const resolveAdminCredentials = (env = process.env) => {
  const password = env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      'Falta ADMIN_PASSWORD. Definila en server/.env (o en el entorno) antes de correr el seed; no hay valor por defecto.'
    );
  }

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD es demasiado corta: se exigen al menos ${MIN_ADMIN_PASSWORD_LENGTH} caracteres.`
    );
  }

  // Sin valor por defecto: un email inventado crearía un admin que nadie reconoce, y
  // con la contraseña de este entorno.
  const email = String(env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    throw new Error(
      'Falta ADMIN_EMAIL. Definila en server/.env (o en el entorno) antes de correr el seed; no hay valor por defecto.'
    );
  }
  if (!isValidEmail(email)) {
    throw new Error('ADMIN_EMAIL no tiene un formato de email válido.');
  }

  return { email, password };
};
