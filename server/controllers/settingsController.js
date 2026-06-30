import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import { writeAuditLog } from '../utils/auditLogger.js';

const VALID_THEMES = ['default', 'elegante', 'moderno'];

const defaultSettings = {
  singletonKey: 'main',
  theme: 'default',
  contactEmail: 'piscinas@playaysol.com.ar',
  whatsappNumber: '5493534224605',
  phoneNumberDisplay: '3534224605',
  phoneNumberLink: 'tel:+543534224605',
  secondaryContactLabel: 'Ventas y presupuestos',
  secondaryContactWhatsapp: '5493535668994',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sábados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ singletonKey: 'main' });
  if (!settings) {
    settings = await Settings.create(defaultSettings);
  }
  return settings;
};

const sanitizeBusinessHours = (hours) => {
  if (!Array.isArray(hours)) return defaultSettings.businessHours;

  const normalized = hours
    .map((item) => ({
      day: String(item?.day || '').trim(),
      hours: String(item?.hours || '').trim(),
    }))
    .filter((item) => item.day && item.hours)
    .slice(0, 14);

  return normalized.length > 0 ? normalized : defaultSettings.businessHours;
};

const toPublicResponse = (settings) => ({
  theme: settings.theme || 'default',
  contactEmail: settings.contactEmail,
  whatsappNumber: settings.whatsappNumber,
  phoneNumberDisplay: settings.phoneNumberDisplay,
  phoneNumberLink: settings.phoneNumberLink,
  secondaryContactLabel: settings.secondaryContactLabel || '',
  secondaryContactWhatsapp: settings.secondaryContactWhatsapp || '',
  contactPhotoUrl: settings.contactPhotoUrl || '',
  aboutPhotoUrl: settings.aboutPhotoUrl || '',
  businessHours: settings.businessHours,
});

// GET /api/settings/public
export const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(toPublicResponse(settings));
});

// GET /api/settings/admin
export const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(toPublicResponse(settings));
});

// PUT /api/settings/admin
export const updateAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const contactEmail = String(req.body?.contactEmail || '').trim();
  const whatsappNumber = String(req.body?.whatsappNumber || '').trim();
  const phoneNumberDisplay = String(req.body?.phoneNumberDisplay || '').trim();
  const phoneNumberLink = String(req.body?.phoneNumberLink || '').trim();
  const secondaryContactLabel = req.body?.secondaryContactLabel;
  const secondaryContactWhatsapp = req.body?.secondaryContactWhatsapp;
  const theme = String(req.body?.theme || '').trim();

  if (theme && VALID_THEMES.includes(theme)) {
    settings.theme = theme;
  }
  settings.contactEmail = contactEmail || settings.contactEmail;
  settings.whatsappNumber = whatsappNumber || settings.whatsappNumber;
  settings.phoneNumberDisplay = phoneNumberDisplay || settings.phoneNumberDisplay;
  settings.phoneNumberLink = phoneNumberLink || settings.phoneNumberLink;
  if (secondaryContactLabel !== undefined) settings.secondaryContactLabel = String(secondaryContactLabel).trim();
  if (secondaryContactWhatsapp !== undefined) settings.secondaryContactWhatsapp = String(secondaryContactWhatsapp).trim();
  settings.businessHours = sanitizeBusinessHours(req.body?.businessHours);

  await settings.save();

  await writeAuditLog({
    req,
    action: 'SETTINGS_UPDATED',
    entity: 'settings',
    entityId: settings._id,
    message: 'Configuracion general actualizada',
  });

  res.json({
    message: 'Configuracion actualizada correctamente',
    settings: toPublicResponse(settings),
  });
});

const PHOTO_FIELDS = {
  contact: { url: 'contactPhotoUrl', publicId: 'contactPhotoPublicId' },
  about: { url: 'aboutPhotoUrl', publicId: 'aboutPhotoPublicId' },
};

const uploadPhoto = (target) => asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No se recibió ninguna imagen');
  }

  const { url, publicId } = PHOTO_FIELDS[target];
  const settings = await getOrCreateSettings();

  if (settings[publicId]) {
    await cloudinary.uploader.destroy(settings[publicId]).catch(() => {});
  }

  settings[url] = req.file.path;
  settings[publicId] = req.file.filename;
  await settings.save();

  await writeAuditLog({
    req,
    action: 'SETTINGS_UPDATED',
    entity: 'settings',
    entityId: settings._id,
    message: `Foto de ${target === 'contact' ? 'contacto' : 'nosotros'} actualizada`,
  });

  res.json({ settings: toPublicResponse(settings) });
});

// POST /api/settings/contact-photo — admin
export const uploadContactPhoto = uploadPhoto('contact');

// POST /api/settings/about-photo — admin
export const uploadAboutPhoto = uploadPhoto('about');

// GET /api/settings/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// POST /api/settings/users
export const createUser = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Nombre, email y contrasena son requeridos');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Ya existe un usuario con ese email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  await writeAuditLog({
    req,
    action: 'ADMIN_USER_CREATED',
    entity: 'user',
    entityId: user._id,
    message: `Usuario admin creado: ${user.email}`,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

// DELETE /api/settings/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const targetId = String(req.params.id || '');

  if (String(req.user?._id) === targetId) {
    res.status(400);
    throw new Error('No podes eliminar tu propio usuario en sesion');
  }

  const user = await User.findById(targetId);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const deletedUserId = user._id;
  const deletedUserEmail = user.email;

  await user.deleteOne();

  await writeAuditLog({
    req,
    action: 'ADMIN_USER_DELETED',
    entity: 'user',
    entityId: deletedUserId,
    message: `Usuario admin eliminado: ${deletedUserEmail}`,
  });

  res.json({ message: 'Usuario eliminado correctamente' });
});
