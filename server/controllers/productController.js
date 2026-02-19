import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';

// GET /api/products — público
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, featured, page = 1, limit = 20 } = req.query;
  const filter = { active: true };

  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search) filter.$text = { $search: search };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(featured === 'true' ? { featured: -1 } : { createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/products/categories — público
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { active: true });
  res.json(categories);
});

// GET /api/products/:id — público
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.active) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(product);
});

// POST /api/products — admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, featured, tags } = req.body;

  const images = req.files
    ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
    : [];

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    stock: Number(stock),
    category,
    featured: featured === 'true',
    tags: tags ? JSON.parse(tags) : [],
    images,
  });

  res.status(201).json(product);
});

// PUT /api/products/:id — admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, featured, active, tags, removeImages } =
    req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Remove selected images from Cloudinary
  if (removeImages) {
    const toRemove = JSON.parse(removeImages);
    for (const publicId of toRemove) {
      await cloudinary.uploader.destroy(publicId);
    }
    product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
  }

  // Add new images
  if (req.files?.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    product.images.push(...newImages);
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (category !== undefined) product.category = category;
  if (featured !== undefined) product.featured = featured === 'true';
  if (active !== undefined) product.active = active === 'true';
  if (tags !== undefined) product.tags = JSON.parse(tags);

  const updated = await product.save();
  res.json(updated);
});

// PATCH /api/products/:id/stock — admin
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock: Number(stock) },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(product);
});

// DELETE /api/products/:id — admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
  }

  await product.deleteOne();
  res.json({ message: 'Producto eliminado' });
});

// GET /api/products/admin/all — admin (incluye inactivos)
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const total = await Product.countDocuments();
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  res.json({ products, total });
});
