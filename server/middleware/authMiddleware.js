import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { parseCookies } from '../utils/cookies.js';
import { SESSION_COOKIE } from '../config/session.js';
import { csrfGuard } from './csrf.js';

export const protect = asyncHandler(async (req, res, next) => {
  // Un solo camino de autenticación: la cookie httpOnly. El header Authorization ya no se
  // acepta, así que un token filtrado o pegado a mano no sirve.
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, token no encontrado');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('Usuario no encontrado');
    }
  } catch {
    res.status(401);
    throw new Error('No autorizado, token inválido');
  }

  // Autenticado por cookie: los métodos que cambian estado exigen además el header
  // X-Requested-With y un Origin/Referer permitido (ver middleware/csrf.js).
  csrfGuard(req, res, next);
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403);
  throw new Error('Acceso denegado, se requiere rol admin');
};
