import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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