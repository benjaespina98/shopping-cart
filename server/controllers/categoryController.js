import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { escapeRegExp } from '../utils/regex.js';

// Siembra la colección de categorías a partir de las categorías ya usadas por los
// productos, la primera vez que se consulta y todavía no hay ninguna. Idempotente:
// si ya existen categorías no hace nada.
async function ensureSeeded() {
  const count = await Category.estimatedDocumentCount();
  if (count > 0) return;
  const names = await Product.distinct('category', { category: { $nin: [null, ''] } });
  if (names.length === 0) return;
  await Category.insertMany(
    names.map((name, i) => ({ name, order: i })),
    { ordered: false }
  ).catch(() => {}); // ignora duplicados en carreras de arranque
}

// GET /api/categories — público
export const getCategories = asyncHandler(async (req, res) => {
  await ensureSeeded();
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  res.json(categories);
});

// POST /api/categories — admin
export const createCategory = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    res.status(400);
    throw new Error('El nombre es requerido');
  }
  const exists = await Category.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') });
  if (exists) {
    res.status(409);
    throw new Error('Ya existe una categoría con ese nombre');
  }
  const count = await Category.estimatedDocumentCount();
  const category = await Category.create({ name, order: count });
  res.status(201).json(category);
});

// PUT /api/categories/:id — admin (renombra y propaga el cambio a los productos)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
  const name = (req.body.name || '').trim();
  if (!name) {
    res.status(400);
    throw new Error('El nombre es requerido');
  }

  if (name !== category.name) {
    const exists = await Category.findOne({
      _id: { $ne: category._id },
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
    });
    if (exists) {
      res.status(409);
      throw new Error('Ya existe una categoría con ese nombre');
    }
    const oldName = category.name;
    category.name = name;
    await category.save();
    // Mantiene el vínculo: los productos guardan la categoría como texto
    await Product.updateMany({ category: oldName }, { category: name });
  }

  res.json(category);
});

// DELETE /api/categories/:id — admin (bloquea si hay productos que la usan)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
  const inUse = await Product.countDocuments({ category: category.name });
  if (inUse > 0) {
    res.status(409);
    throw new Error(
      `No se puede eliminar: ${inUse} producto(s) usan esta categoría. Reasignalos o eliminalos primero.`
    );
  }
  await category.deleteOne();
  res.json({ message: 'Categoría eliminada' });
});
