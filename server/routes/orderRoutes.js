import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { orderFormLimiter } from '../middleware/formLimiter.js';

const router = Router();

// Pública — cliente envía carrito
router.post('/', orderFormLimiter, createOrder);

// Admin
router.get('/', protect, adminOnly, getOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
