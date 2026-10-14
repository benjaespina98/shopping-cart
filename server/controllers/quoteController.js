import asyncHandler from 'express-async-handler';
import QuoteRequest from '../models/QuoteRequest.js';
import { sendQuoteNotification } from '../utils/mailer.js';
import { writeAuditLog } from '../utils/auditLogger.js';
import { isValidEmail, hasControlChars } from '../utils/validation.js';
import { isHoneypotTripped, recordHoneypotHit } from '../utils/antiSpam.js';

const PHONE_RE = /^[\d\s()+-]{6,30}$/;

// Mismos topes que el modelo QuoteRequest; se validan acá para devolver un 400 claro en vez
// de depender del error de Mongoose. `singleLine`: el campo termina en un header de mail
// (subject, replyTo) o en una sola línea, así que no admite saltos ni caracteres de control
// (inyección de headers).
const QUOTE_FIELDS = {
  projectType: { label: 'El tipo de proyecto', max: 150, singleLine: true },
  name: { label: 'El nombre', max: 150, singleLine: true },
  phone: { label: 'El teléfono', max: 30, singleLine: true },
  email: { label: 'El email', max: 150, singleLine: true },
  location: { label: 'La localidad', max: 300, singleLine: true },
  message: { label: 'El mensaje', max: 3000, singleLine: false },
};

// Valida y normaliza el body de POST /api/quotes. Devuelve { data } o { error }.
export const parseQuoteBody = (body) => {
  const input = body && typeof body === 'object' ? body : {};
  const data = {};

  for (const [field, rule] of Object.entries(QUOTE_FIELDS)) {
    const raw = input[field];
    if (raw !== undefined && raw !== null && typeof raw !== 'string') {
      return { error: `${rule.label} no es válido.` };
    }
    const value = (raw || '').trim();
    if (value.length > rule.max) {
      return { error: `${rule.label} es demasiado largo (máximo ${rule.max} caracteres).` };
    }
    if (rule.singleLine && hasControlChars(value)) {
      return { error: `${rule.label} contiene caracteres no permitidos.` };
    }
    data[field] = value;
  }

  if (!data.projectType || !data.name || !data.phone || !data.email) {
    return { error: 'Tipo de proyecto, nombre, teléfono y email son requeridos' };
  }
  if (!isValidEmail(data.email)) {
    return { error: 'Ingresá un email válido.' };
  }
  if (!PHONE_RE.test(data.phone)) {
    return { error: 'Ingresá un teléfono válido.' };
  }

  data.source = input.source === 'contact' ? 'contact' : 'quote';
  return { data };
};

// POST /api/quotes — público
export const createQuoteRequest = asyncHandler(async (req, res) => {
  const parsed = parseQuoteBody(req.body);
  if (parsed.error) {
    res.status(400);
    throw new Error(parsed.error);
  }
  const { projectType, name, phone, email, location, message, source } = parsed.data;

  // Honeypot: se responde igual que un éxito real, sin guardar ni mandar mail.
  if (isHoneypotTripped(req.body)) {
    recordHoneypotHit('quotes');
    const fake = new QuoteRequest(parsed.data).toObject();
    fake.createdAt = new Date();
    fake.updatedAt = fake.createdAt;
    fake.__v = 0;
    res.status(201).json(fake);
    return;
  }

  const quote = await QuoteRequest.create({
    projectType, name, phone, email, location, message, source,
  });

  const emailSent = await sendQuoteNotification(quote).catch((err) => {
    console.error('[quotes] error enviando email de notificación:', err.message);
    return false;
  });
  if (emailSent) {
    quote.emailSent = true;
    await quote.save();
  }

  await writeAuditLog({
    req,
    action: 'QUOTE_REQUEST_CREATED',
    entity: 'quote',
    entityId: quote._id,
    message: 'Nueva solicitud de presupuesto',
    meta: { projectType, name, emailSent },
  });

  res.status(201).json(quote);
});

// GET /api/quotes — admin
export const getQuoteRequests = asyncHandler(async (req, res) => {
  const quotes = await QuoteRequest.find().sort({ createdAt: -1 });
  res.json(quotes);
});

const QUOTE_STATUSES = ['new', 'contacted', 'closed'];

// PATCH /api/quotes/:id/status — admin
export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Igual que en orderController: findByIdAndUpdate no valida contra el enum
  // del schema por sí solo, así que se chequea a mano antes de escribir.
  if (!QUOTE_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Estado inválido. Debe ser uno de: ${QUOTE_STATUSES.join(', ')}`);
  }

  const quote = await QuoteRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!quote) {
    res.status(404);
    throw new Error('Solicitud no encontrada');
  }

  await writeAuditLog({
    req,
    action: 'QUOTE_STATUS_UPDATED',
    entity: 'quote',
    entityId: quote._id,
    message: `Estado actualizado a ${status}`,
    meta: { status },
  });

  res.json(quote);
});
