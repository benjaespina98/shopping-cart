import { Router } from 'express';
import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getAllProductsAdmin,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Públicas
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
