import { Router } from 'express';
import {
  getServices,
  getServicesAdmin,
  createService,
  updateService,
  reorderServices,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadServices } from '../config/cloudinary.js';

const router = Router();

router.get('/', getServices);
router.get('/admin', protect, adminOnly, getServicesAdmin);
router.post('/', protect, adminOnly, uploadServices.single('image'), createService);
router.put('/reorder', protect, adminOnly, reorderServices);
router.put('/:id', protect, adminOnly, uploadServices.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

export default router;
