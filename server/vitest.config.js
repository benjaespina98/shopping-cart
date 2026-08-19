import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // mongodb-memory-server descarga/arranca un mongod real la primera vez;
    // los defaults de vitest (5s) lo cortan a mitad de arranque en CI frío.
    testTimeout: 30000,
    hookTimeout: 30000,
    // Cada archivo levanta su propio Mongo en memoria — correrlos en paralelo
    // multiplica la RAM y el tiempo de arranque sin necesidad.
    fileParallelism: false,
  },
});
