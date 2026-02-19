import { Router } from 'express';
import {
  getSummary,
  getOrdersOverTime,
  getTopProducts,
  getCategoryStats,
} from '../controllers/metricsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/summary', getSummary);
router.get('/orders-over-time', getOrdersOverTime);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoryStats);

export default router;
