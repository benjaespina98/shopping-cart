import { Router } from 'express';
import {
  getProducts,
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
// /products/categories se eliminó: devolvía las categorías distintas de los productos,
// compitiendo con /api/categories (la colección que administra el panel). Dos fuentes
// para el mismo dato, y ninguna pantalla usaba ésta.
router.get('/:id', getProductById);

// Admin
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
