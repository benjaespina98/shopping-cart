import asyncHandler from 'express-async-handler';
import AuditLog from '../models/AuditLog.js';

// GET /api/logs — admin
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, action, entity, search } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number(limit) || 30));

  const filter = {};
  if (action) filter.action = String(action);
  if (entity) filter.entity = String(entity);

  if (search) {
    const regex = new RegExp(String(search), 'i');
    filter.$or = [
      { message: regex },
      { entityId: regex },
      { 'actor.email': regex },
      { 'actor.name': regex },
    ];
  }

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber);

  res.json({
    logs,
    total,
    page: pageNumber,
    pages: Math.max(1, Math.ceil(total / limitNumber)),
  });
});
