import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', protect, getMe);
// endpoint deshabilitado por seguridad a petición
// router.put('/change-password', protect, changePassword);

export default router;
