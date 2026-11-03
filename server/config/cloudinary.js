import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { loadServerEnv } from './env.js';

// app.js llama a loadServerEnv() en su propio cuerpo, pero los imports de ES modules
// se evalúan todos ANTES que ese código — este archivo (importado transitivamente vía
// las rutas) terminaba leyendo process.env.CLOUDINARY_* como undefined en desarrollo
// local (en Vercel no pasaba porque las env vars ya están en process.env de entrada).
// Cargar el .env acá mismo asegura que esté disponible sin importar el orden de imports.
loadServerEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  const err = new Error('Formato no permitido. Subí una imagen JPG, PNG o WEBP.');
  err.statusCode = 400;
  cb(err);
};

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

// Motor de almacenamiento de multer que sube directo a Cloudinary. Reemplaza a multer-storage-cloudinary,
// abandonado y atado a cloudinary 1.x (con un aviso de inyección de parámetros, GHSA de cloudinary < 2.7.0).
// Mantiene el mismo contrato que usan los controllers: `file.path` = URL segura y `file.filename` = public_id.
export const cloudinaryStorage = ({ cloudinary: client, params }) => ({
  _handleFile(req, file, cb) {
    const upload = client.uploader.upload_stream({ resource_type: 'image', ...params }, (error, result) => {
      if (error || !result) return cb(error || new Error('No se pudo subir la imagen'));
      return cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
    });
    file.stream.once('error', cb);
    file.stream.pipe(upload);
  },
  _removeFile(req, file, cb) {
    if (!file.filename) return cb(null);
    return client.uploader.destroy(file.filename, () => cb(null));
  },
});

// Había cinco bloques CloudinaryStorage prácticamente iguales, que sólo cambiaban la
// carpeta y el ancho máximo. Un único creador evita que se desincronicen (de hecho la
// carpeta de productos era la única que además limitaba el alto).
//
// `fetch_format: 'auto'` hace que el original quede guardado ya en el formato más
// liviano que soporte Cloudinary; la entrega igual pide f_auto/q_auto desde el cliente,
// pero así el archivo base tampoco es un JPG pesado.
const createUploader = ({ folder, width, maxFileSizeMb = 8 }) =>
  multer({
    storage: cloudinaryStorage({
      cloudinary,
      params: {
        folder: `shopping-cart/${folder}`,
        allowed_formats: ALLOWED_FORMATS,
        transformation: [{ width, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
    }),
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
    fileFilter,
  });

export const upload = createUploader({ folder: 'products', width: 1000, maxFileSizeMb: 5 });
export const uploadProjects = createUploader({ folder: 'projects', width: 1400 });
export const uploadServices = createUploader({ folder: 'services', width: 1400 });
export const uploadSettings = createUploader({ folder: 'settings', width: 1200 });
export { cloudinary };
