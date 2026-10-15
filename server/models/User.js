import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MIN_PASSWORD_LENGTH } from '../utils/validation.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // Se valida sobre el texto plano, antes del hash (pre-save), y solo cuando la contraseña se
    // modifica: el hash bcrypt ya guardado mide 60 caracteres, así que las cuentas existentes
    // no se ven afectadas por subir el mínimo.
    password: {
      type: String,
      required: true,
      minlength: [MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`],
    },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
