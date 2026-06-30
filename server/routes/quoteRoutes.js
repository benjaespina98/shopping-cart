import { Router } from 'express';
import {
  createQuoteRequest,
  getQuoteRequests,
  updateQuoteStatus,
} from '../controllers/quoteController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', createQuoteRequest);
router.get('/', protect, adminOnly, getQuoteRequests);
router.patch('/:id/status', protect, adminOnly, updateQuoteStatus);

export default router;
