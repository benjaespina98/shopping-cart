import { Schema, model } from 'mongoose';

const quoteRequestSchema = new Schema(
  {
    // Endpoint público sin auth — sin un tope, un envío repetido con textos enormes infla
    // la colección sin ningún beneficio (el body de Express ya corta en ~100kb, pero eso
    // solo limita UN request, no impide mandar miles de esos).
    projectType: { type: String, required: true, trim: true, maxlength: 150 },
    source:      { type: String, enum: ['quote', 'contact'], default: 'quote' },
    name:        { type: String, required: true, trim: true, maxlength: 150 },
    phone:       { type: String, required: true, trim: true, maxlength: 30 },
    email:       { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    location:    { type: String, default: '', trim: true, maxlength: 300 },
    message:     { type: String, default: '', trim: true, maxlength: 3000 },
    status:      { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    emailSent:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

quoteRequestSchema.index({ createdAt: -1 });

export default model('QuoteRequest', quoteRequestSchema);
