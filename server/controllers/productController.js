import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { cloudinary } from '../config/cloudinary.js';
import { writeAuditLog } from '../utils/auditLogger.js';
import { escapeRegExp } from '../utils/regex.js';
import { toBoolean, parseJsonArray } from '../utils/parsing.js';

// El producto guarda la categoría como texto, no como referencia. Eso funciona (renombrar
// una categoría propaga el cambio a los productos, y no se puede borrar una en uso),
// pero hasta ahora la API aceptaba cualquier texto: un producto podía quedar en una
// categoría inexistente, invisible desde los filtros de la tienda y desde el admin.
// Acá se valida contra la colección y se guarda el nombre canónico, así "limpieza" y
// "Limpieza" no terminan siendo dos categorías distintas.
const resolveCategoryName = async (rawCategory, res) => {
  const name = String(rawCategory || '').trim();
  if (!name) {
    res.status(400);
    throw new Error('La categoría es requerida');
  }

  const category = await Category.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') }).lean();
  if (!category) {
    res.status(400);
    throw new Error(`La categoría "${name}" no existe. Creala primero desde Productos › Categorías.`);
  }

  return category.name;
};

// GET /api/products — público
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, featured, sort, page = 1, limit = 20 } = req.query;
  const filter = { active: true };

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 20));

  if (category) filter.category = category;
  if (toBoolean(featured)) filter.featured = true;
  if (search) filter.$text = { $search: search };

  const sortMap = {
    price_asc: { price: 1, name: 1 },
    price_desc: { price: -1, name: 1 },
    name_asc: { name: 1 },
  };

  const sortQuery = sortMap[sort] || (toBoolean(featured) ? { featured: -1, createdAt: -1 } : { createdAt: -1 });

  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .select('name description price stock category images featured active tags createdAt updatedAt')
      .sort(sortQuery)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .lean(),
  ]);

  res.json({
    products,
    total,
    page: pageNumber,
    pages: Math.max(1, Math.ceil(total / limitNumber)),
  });
});

// GET /api/products/:id — público
export const getProductById = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  const product = await Product.findById(req.params.id)
    .select('name description price stock category images featured active tags createdAt updatedAt')
    .lean();
  if (!product || !product.active) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(product);
});

// POST /api/products — admin
export const createProduct = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  try {
    const { name, description, price, stock, category, featured, tags } = req.body;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category: await resolveCategoryName(category, res),
      featured: toBoolean(featured),
      tags: parseJsonArray(tags),
      images,
    });

    await writeAuditLog({
      req,
      action: 'PRODUCT_CREATED',
      entity: 'product',
      entityId: product._id,
      message: `Producto creado: ${product.name}`,
      meta: {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    // multer ya subió las imágenes a Cloudinary antes de llegar acá. Si la creación
    // falla (categoría inexistente, validación del modelo), sin esto quedaban archivos
    // huérfanos ocupando la cuenta sin ningún producto que los referencie.
    await Promise.all(
      images.map(({ publicId }) => cloudinary.uploader.destroy(publicId).catch(() => {}))
    );
    console.error('Error al crear producto:', error);
    throw error;
  }
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
  const toRemove = parseJsonArray(removeImages);
  if (toRemove.length > 0) {
    for (const publicId of toRemove) {
      await cloudinary.uploader.destroy(publicId);
    }
    product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
  }

  // Add new images. multer ya las subió a Cloudinary en este punto — si algo más abajo
  // falla (categoría inexistente, validación del modelo) hay que borrarlas para no dejar
  // archivos huérfanos, igual que ya se hace en createProduct.
  const newImages = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
  if (newImages.length > 0) {
    product.images.push(...newImages);
  }

  let updated;
  try {
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = await resolveCategoryName(category, res);
    if (featured !== undefined) product.featured = toBoolean(featured);
    if (active !== undefined) product.active = toBoolean(active);
    if (tags !== undefined) product.tags = parseJsonArray(tags);

    updated = await product.save();
  } catch (error) {
    await Promise.all(
      newImages.map(({ publicId }) => cloudinary.uploader.destroy(publicId).catch(() => {}))
    );
    throw error;
  }

  await writeAuditLog({
    req,
    action: 'PRODUCT_UPDATED',
    entity: 'product',
    entityId: updated._id,
    message: `Producto actualizado: ${updated.name}`,
    meta: {
      name: updated.name,
      category: updated.category,
      price: updated.price,
      stock: updated.stock,
      active: updated.active,
    },
  });

  res.json(updated);
});

// PATCH /api/products/:id/stock — admin
export const updateStock = asyncHandler(async (req, res) => {
  const stockValue = Number(req.body.stock);

  // El panel siempre manda un número >= 0, pero findByIdAndUpdate no corre los
  // validadores del schema (min: 0) salvo que se pida — así que un stock
  // negativo llegado por API directa quedaba guardado sin más, y después
  // rompía la resta atómica de stock en createOrder (que exige $gte: quantity).
  if (!Number.isFinite(stockValue) || stockValue < 0) {
    res.status(400);
    throw new Error('El stock debe ser un número mayor o igual a 0');
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock: stockValue },
    { new: true, runValidators: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  await writeAuditLog({
    req,
    action: 'PRODUCT_STOCK_UPDATED',
    entity: 'product',
    entityId: product._id,
    message: `Stock actualizado para ${product.name}`,
    meta: { stock: product.stock },
  });

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

  const productName = product.name;
  const productId = product._id;

  await product.deleteOne();

  await writeAuditLog({
    req,
    action: 'PRODUCT_DELETED',
    entity: 'product',
    entityId: productId,
    message: `Producto eliminado: ${productName}`,
  });

  res.json({ message: 'Producto eliminado' });
});

// GET /api/products/admin/all — admin (incluye inactivos)
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number(limit) || 50));
  const [total, products] = await Promise.all([
    Product.countDocuments(),
    Product.find()
      .select('name description price stock category images featured active tags createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .lean(),
  ]);
  res.json({ products, total });
});
