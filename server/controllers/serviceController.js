import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import { cloudinary } from '../config/cloudinary.js';

// GET /api/services — público (solo activos)
export const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json(services);
});

// GET /api/services/admin — admin (todos, incl. inactivos)
export const getServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ order: 1, createdAt: 1 });
  res.json(services);
});

// POST /api/services — admin
export const createService = asyncHandler(async (req, res) => {
  const { title, tag, description, bullets, tone, variant, active, cta } = req.body;
  if (!title || !tag || !description) {
    res.status(400);
    throw new Error('title, tag y description son requeridos');
  }
  const count = await Service.countDocuments();
  let parsedBullets = [];
  if (bullets) {
    try {
      parsedBullets = JSON.parse(bullets);
    } catch {
      parsedBullets = String(bullets).split(',').map((b) => b.trim()).filter(Boolean);
    }
  }
  const service = await Service.create({
    title,
    tag,
    description,
    bullets: parsedBullets,
    tone: tone || 'teal',
    variant: variant || 'soft',
    cta: cta || 'Solicitar presupuesto',
    active: active === 'true' || active === true || active === undefined,
    imageUrl: req.file?.path || '',
    publicId: req.file?.filename || '',
    order: count,
  });
  res.status(201).json(service);
});

// PUT /api/services/:id — admin
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Servicio no encontrado');
  }

  const { title, tag, description, bullets, tone, variant, active, cta } = req.body;
  if (title !== undefined)       service.title       = title;
  if (tag !== undefined)         service.tag         = tag;
  if (description !== undefined) service.description = description;
  if (tone !== undefined)        service.tone        = tone;
  if (variant !== undefined)     service.variant     = variant;
  if (cta !== undefined)         service.cta         = cta;
  if (active !== undefined)      service.active      = active === 'true' || active === true;
  if (bullets !== undefined) {
    try {
      service.bullets = JSON.parse(bullets);
    } catch {
      service.bullets = String(bullets).split(',').map((b) => b.trim()).filter(Boolean);
    }
  }

  if (req.file) {
    if (service.publicId) {
      await cloudinary.uploader.destroy(service.publicId).catch(() => {});
    }
    service.imageUrl = req.file.path;
    service.publicId = req.file.filename;
  }

  await service.save();
  res.json(service);
});

// PUT /api/services/reorder — admin
export const reorderServices = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Se espera un array de items');
  }
  await Promise.all(items.map(({ id, order }) => Service.findByIdAndUpdate(id, { order })));
  res.json({ message: 'Orden actualizado' });
});

// DELETE /api/services/:id — admin
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Servicio no encontrado');
  }
  if (service.publicId) {
    await cloudinary.uploader.destroy(service.publicId).catch(() => {});
  }
  await service.deleteOne();
  res.json({ message: 'Servicio eliminado' });
});
