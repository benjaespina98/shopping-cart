import { describe, it, expect, vi } from 'vitest';
import { PassThrough } from 'node:stream';
import { cloudinaryStorage } from '../config/cloudinary.js';

// Cliente de Cloudinary falso: upload_stream devuelve un stream de escritura y llama al callback al terminar.
const fakeClient = (outcome) => {
  const calls = { options: null, received: '' };
  const client = {
    uploader: {
      upload_stream: vi.fn((options, done) => {
        calls.options = options;
        const sink = new PassThrough();
        sink.on('data', (chunk) => { calls.received += chunk.toString(); });
        sink.on('end', () => done(outcome.error, outcome.result));
        return sink;
      }),
      destroy: vi.fn((id, done) => done()),
    },
  };
  return { client, calls };
};

const handle = (storage, content = 'imagen') =>
  new Promise((resolve, reject) => {
    const stream = new PassThrough();
    storage._handleFile({}, { stream }, (err, info) => (err ? reject(err) : resolve(info)));
    stream.end(content);
  });

describe('cloudinaryStorage', () => {
  it('sube el archivo con las opciones pedidas y devuelve la URL segura y el public_id', async () => {
    const { client, calls } = fakeClient({ result: { secure_url: 'https://res.cloudinary.com/x/a.jpg', public_id: 'shopping-cart/products/a', bytes: 6 } });
    const storage = cloudinaryStorage({ cloudinary: client, params: { folder: 'shopping-cart/products', allowed_formats: ['jpg'] } });

    const info = await handle(storage);

    expect(info).toEqual({ path: 'https://res.cloudinary.com/x/a.jpg', filename: 'shopping-cart/products/a', size: 6 });
    expect(calls.received).toBe('imagen');
    expect(calls.options).toMatchObject({ resource_type: 'image', folder: 'shopping-cart/products', allowed_formats: ['jpg'] });
  });

  it('propaga el error de Cloudinary para que la ruta responda con falla en vez de guardar basura', async () => {
    const { client } = fakeClient({ error: new Error('Invalid image file') });
    await expect(handle(cloudinaryStorage({ cloudinary: client, params: {} }))).rejects.toThrow('Invalid image file');
  });

  it('borra el archivo subido por public_id cuando multer lo descarta', async () => {
    const { client } = fakeClient({});
    const storage = cloudinaryStorage({ cloudinary: client, params: {} });

    await new Promise((resolve) => storage._removeFile({}, { filename: 'shopping-cart/products/a' }, resolve));

    expect(client.uploader.destroy).toHaveBeenCalledWith('shopping-cart/products/a', expect.any(Function));
  });
});
