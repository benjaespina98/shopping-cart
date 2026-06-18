import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  reorderProjects,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadProjects } from '../config/cloudinary.js';

const router = Router();

router.get('/', getProjects);
router.post('/', protect, adminOnly, uploadProjects.single('image'), createProject);
router.put('/reorder', protect, adminOnly, reorderProjects);
router.put('/:id', protect, adminOnly, uploadProjects.single('image'), updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

export default router;
