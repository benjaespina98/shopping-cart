import { Schema, model } from 'mongoose';

const serviceSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    tag:         { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    bullets:     { type: [String], default: [] },
    cta:         { type: String, trim: true, default: 'Solicitar presupuesto' },
    tone:        { type: String, enum: ['sun', 'teal'], default: 'teal' },
    variant:     { type: String, enum: ['solid', 'soft'], default: 'soft' },
    imageUrl:    { type: String, default: '' },
    publicId:    { type: String, default: '' },
    active:      { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model('Service', serviceSchema);
