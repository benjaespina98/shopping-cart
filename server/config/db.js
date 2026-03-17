import mongoose from 'mongoose';
import { resolveMongoConnection } from './env.js';

let cachedConnection = null;
let connectingPromise = null;

export const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  const { uri, label } = resolveMongoConnection();

  connectingPromise = mongoose
    .connect(uri)
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
