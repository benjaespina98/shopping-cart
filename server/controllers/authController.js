import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { writeAuditLog } from '../utils/auditLogger.js';

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

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});
