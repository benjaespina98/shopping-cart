import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
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
  cb(new Error('Solo se permiten imágenes JPG, PNG y WEBP'));
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopping-cart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopping-cart/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }],
  },
});

const projectsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopping-cart/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }],
  },
});

const servicesStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopping-cart/services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }],
  },
});

const settingsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopping-cart/settings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export const uploadGallery = multer({ storage: galleryStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter });
export const uploadProjects = multer({ storage: projectsStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter });
export const uploadServices = multer({ storage: servicesStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter });
export const uploadSettings = multer({ storage: settingsStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter });
export { cloudinary };
