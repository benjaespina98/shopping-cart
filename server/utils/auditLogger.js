import AuditLog from '../models/AuditLog.js';

const getRequestIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '';
};

export const writeAuditLog = async ({ req, action, entity, entityId = '', message = '', meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId ? String(entityId) : '',
      message,
      meta,
      actor: {
        userId: req.user?._id || null,
        email: req.user?.email || '',
        name: req.user?.name || '',
        role: req.user?.role || '',
      },
      request: {
        method: req.method || '',
        path: req.originalUrl || req.path || '',
        ip: getRequestIp(req),
        userAgent: req.headers['user-agent'] || '',
      },
    });
  } catch (error) {
    // Logging must never break the main operation.
    console.error('Audit log write failed:', error.message);
  }
};
