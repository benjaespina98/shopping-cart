import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

// Pública — cliente envía carrito
router.post('/', createOrder);

// Admin
router.get('/', protect, adminOnly, getOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
