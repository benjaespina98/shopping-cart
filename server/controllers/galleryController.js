import asyncHandler from 'express-async-handler';
import GalleryImage from '../models/GalleryImage.js';
import { cloudinary } from '../config/cloudinary.js';

// GET /api/gallery — público
export const getGallery = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find().sort({ order: 1, createdAt: 1 });
  res.json(images);
});

// POST /api/gallery — admin, sube imagen a Cloudinary
export const addGalleryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No se recibió ninguna imagen');
  }

  const { alt } = req.body;
  const count = await GalleryImage.countDocuments();

  const image = await GalleryImage.create({
    url: req.file.path,
    publicId: req.file.filename,
    alt: alt || 'Imagen de galería',
    order: count,
  });

  res.status(201).json(image);
});

// PUT /api/gallery/:id — admin, edita alt
export const updateGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Imagen no encontrada');
  }

  if (req.body.alt !== undefined) image.alt = req.body.alt;
  await image.save();
  res.json(image);
});

// PUT /api/gallery/reorder — admin, [{id, order}, ...]
export const reorderGallery = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ id, order }]
  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Se espera un array de items');
  }

  await Promise.all(
    items.map(({ id, order }) =>
      GalleryImage.findByIdAndUpdate(id, { order })
    )
  );

  res.json({ message: 'Orden actualizado' });
});

// DELETE /api/gallery/:id — admin
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Imagen no encontrada');
  }

  await cloudinary.uploader.destroy(image.publicId);
  await image.deleteOne();

  res.json({ message: 'Imagen eliminada' });
});
