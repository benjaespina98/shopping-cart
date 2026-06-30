import asyncHandler from 'express-async-handler';
import QuoteRequest from '../models/QuoteRequest.js';
import { sendQuoteNotification } from '../utils/mailer.js';
import { writeAuditLog } from '../utils/auditLogger.js';

// POST /api/quotes — público
export const createQuoteRequest = asyncHandler(async (req, res) => {
  const { projectType, name, phone, email, location, message, source } = req.body;

  if (!projectType || !name || !phone || !email) {
    res.status(400);
    throw new Error('Tipo de proyecto, nombre, teléfono y email son requeridos');
  }

  const quote = await QuoteRequest.create({
    projectType, name, phone, email, location, message,
    source: source === 'contact' ? 'contact' : 'quote',
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

// PATCH /api/quotes/:id/status — admin
export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const quote = await QuoteRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
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
