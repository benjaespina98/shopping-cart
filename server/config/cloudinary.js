import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

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

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export const uploadGallery = multer({ storage: galleryStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter });
export { cloudinary };
