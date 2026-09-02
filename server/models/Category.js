import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// El controller ya rechaza nombres duplicados sin distinguir mayúsculas/minúsculas antes de
// insertar, pero ese chequeo es a nivel app: dos requests concurrentes ("Limpieza" / "limpieza")
// pueden pasar ambos la validación antes de que ninguno haya insertado todavía. Un `unique: true`
// simple no lo evita porque el índice por default es case-sensitive. Con collation strength 2
// (case-insensitive) el propio índice de Mongo rechaza la segunda inserción, y el error 11000
// resultante ya lo traduce app.js a un 409 legible.
//
// Nota de deploy: autoIndex está desactivado en producción/preview (ver config/db.js), así que
// este índice no se crea solo ahí — requiere migrarlo a mano en Atlas una vez:
//   db.categories.dropIndex('name_1')
//   db.categories.createIndex({ name: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } })
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'es', strength: 2 } }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
