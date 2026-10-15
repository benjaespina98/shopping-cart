import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { csrfGuard } from '../middleware/csrf.js';

const router = Router();

router.post('/login', login);
router.post('/logout', csrfGuard, logout);
router.get('/me', protect, getMe);

export default router;
