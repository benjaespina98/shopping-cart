import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSettings } from '../config/cloudinary.js';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
  uploadContactPhoto,
  uploadAboutPhoto,
  getUsers,
  createUser,
  deleteUser,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/public', getPublicSettings);

router.get('/admin', protect, adminOnly, getAdminSettings);
router.put('/admin', protect, adminOnly, updateAdminSettings);
router.post('/contact-photo', protect, adminOnly, uploadSettings.single('image'), uploadContactPhoto);
router.post('/about-photo', protect, adminOnly, uploadSettings.single('image'), uploadAboutPhoto);

router.get('/users', protect, adminOnly, getUsers);
router.post('/users', protect, adminOnly, createUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
