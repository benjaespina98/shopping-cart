import { Router } from 'express';
import {
  getGallery,
  addGalleryImage,
  updateGalleryImage,
  reorderGallery,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadGallery } from '../config/cloudinary.js';

const router = Router();

router.get('/', getGallery);
router.post('/', protect, uploadGallery.single('image'), addGalleryImage);
router.put('/reorder', protect, reorderGallery);
router.put('/:id', protect, updateGalleryImage);
router.delete('/:id', protect, deleteGalleryImage);

export default router;
