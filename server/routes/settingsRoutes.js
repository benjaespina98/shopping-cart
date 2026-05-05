import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
  getUsers,
  createUser,
  deleteUser,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/public', getPublicSettings);

router.get('/admin', protect, adminOnly, getAdminSettings);
router.put('/admin', protect, adminOnly, updateAdminSettings);

// Endpoints resguardados o deshabilitados temporalmente por seguridad
router.get('/users', protect, adminOnly, getUsers);
// router.post('/users', protect, adminOnly, createUser); 
// router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
