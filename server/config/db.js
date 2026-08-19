import mongoose from 'mongoose';
import { resolveMongoConnection } from './env.js';

let cachedConnection = null;
let connectingPromise = null;

export const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  const { uri, label } = resolveMongoConnection();

  // Por default Mongoose valida/crea los índices de cada modelo (createIndexes) en la
  // primera conexión. Los índices ya existen en Atlas — repetir esa verificación en
  // cada cold start de la función serverless (producción y preview) suma varios round
  // trips extra a la nube antes de poder responder el primer request. En desarrollo se
  // deja activado: ahí conviene que un índice nuevo en un modelo se cree solo.
  const autoIndex = label === 'development';

  connectingPromise = mongoose
    .connect(uri, { autoIndex })
    .then((conn) => {
      cachedConnection = conn;
      console.log(`MongoDB connected (${label}): ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    })
    .finally(() => {
      connectingPromise = null;
    });

  return connectingPromise;
};
