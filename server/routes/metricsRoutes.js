import { Router } from 'express';
import {
  getSummary,
  getOrdersOverTime,
} from '../controllers/metricsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/summary', getSummary);
router.get('/orders-over-time', getOrdersOverTime);

export default router;
