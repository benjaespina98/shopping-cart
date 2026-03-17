import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getAuditLogs } from '../controllers/logController.js';

const router = Router();

router.get('/', protect, adminOnly, getAuditLogs);

export default router;
