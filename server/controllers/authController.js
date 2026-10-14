import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { writeAuditLog } from '../utils/auditLogger.js';
import { SESSION_COOKIE, sessionCookieOptions } from '../config/session.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email y contraseña son requeridos');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  req.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  await writeAuditLog({
    req,
    action: 'LOGIN_SUCCESS',
    entity: 'auth',
    entityId: user._id,
    message: 'Inicio de sesion exitoso',
  });

  // El token viaja solo en una cookie httpOnly: nunca en el cuerpo, así el JavaScript de la
  // página no lo ve. Max-Age sale de la propia expiración del JWT (exp - iat), sin parsear
  // el formato de JWT_EXPIRES_IN.
  const token = generateToken(user._id);
  const { iat, exp } = jwt.decode(token);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(exp - iat));
  res.set('Cache-Control', 'no-store');

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// POST /api/auth/logout — borra la cookie de sesión. Idempotente: sirve aunque ya no haya
// sesión. El JWT en sí no se revoca (sigue siendo válido hasta su expiración si alguien lo
// copió antes); el logout lo saca del navegador.
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.set('Cache-Control', 'no-store');
  res.json({ message: 'Sesión cerrada' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  // `protect` ya cargó req.user sin password; no hace falta repetir la query.
  res.json(req.user);
});
