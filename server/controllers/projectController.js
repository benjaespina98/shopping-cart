import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import { cloudinary } from '../config/cloudinary.js';

// GET /api/projects — público
export const getProjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.featured === 'true') filter.featured = true;
  const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(projects);
});

// POST /api/projects — admin
export const createProject = asyncHandler(async (req, res) => {
  const { title, location, category, status, featured, isHero } = req.body;
  if (!title || !location || !category) {
    res.status(400);
    throw new Error('title, location y category son requeridos');
  }
  const count = await Project.countDocuments();
  const wantsHero = isHero === 'true' || isHero === true;
  if (wantsHero) {
    await Project.updateMany({ isHero: true }, { isHero: false });
  }
  const project = await Project.create({
    title,
    location,
    category,
    status: status || 'Terminada',
    featured: featured === 'true' || featured === true,
    isHero: wantsHero,
    imageUrl: req.file?.path || '',
    publicId: req.file?.filename || '',
    order: count,
  });
  res.status(201).json(project);
});

// PUT /api/projects/:id — admin (edita metadatos; si hay imagen nueva, reemplaza)
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Proyecto no encontrado');
  }

  const { title, location, category, status, featured, isHero } = req.body;
  if (title !== undefined)    project.title    = title;
  if (location !== undefined) project.location = location;
  if (category !== undefined) project.category = category;
  if (status !== undefined)   project.status   = status;
  if (featured !== undefined) project.featured = featured === 'true' || featured === true;
  if (isHero !== undefined) {
    const wantsHero = isHero === 'true' || isHero === true;
    if (wantsHero) {
      await Project.updateMany({ _id: { $ne: project._id }, isHero: true }, { isHero: false });
    }
    project.isHero = wantsHero;
  }

  if (req.file) {
    if (project.publicId) {
      await cloudinary.uploader.destroy(project.publicId).catch(() => {});
    }
    project.imageUrl = req.file.path;
    project.publicId = req.file.filename;
  }

  await project.save();
  res.json(project);
});

// PATCH /api/projects/reorder — admin
export const reorderProjects = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Se espera un array de items');
  }
  await Promise.all(items.map(({ id, order }) => Project.findByIdAndUpdate(id, { order })));
  res.json({ message: 'Orden actualizado' });
});

// DELETE /api/projects/:id — admin
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Proyecto no encontrado');
  }
  if (project.publicId) {
    await cloudinary.uploader.destroy(project.publicId).catch(() => {});
  }
  await project.deleteOne();
  res.json({ message: 'Proyecto eliminado' });
});
