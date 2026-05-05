import { Router } from 'express';
import {
  getGallery,
  addGalleryImage,
  updateGalleryImage,
  reorderGallery,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadGallery } from '../config/cloudinary.js';

const router = Router();

router.get('/', getGallery);
router.post('/', protect, adminOnly, uploadGallery.single('image'), addGalleryImage);
router.put('/reorder', protect, adminOnly, reorderGallery);
router.put('/:id', protect, adminOnly, updateGalleryImage);
router.delete('/:id', protect, adminOnly, deleteGalleryImage);

export default router;
