import mongoose from 'mongoose';

let cachedConnection = null;
let connectingPromise = null;

export const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  connectingPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((conn) => {
      cachedConnection = conn;
      console.log(`MongoDB connected: ${conn.connection.host}`);
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
