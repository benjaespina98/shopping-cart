import { Schema, model } from 'mongoose';

const quoteRequestSchema = new Schema(
  {
    projectType: { type: String, required: true, trim: true },
    name:        { type: String, required: true, trim: true },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    location:    { type: String, default: '', trim: true },
    message:     { type: String, default: '', trim: true },
    status:      { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    emailSent:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

quoteRequestSchema.index({ createdAt: -1 });

export default model('QuoteRequest', quoteRequestSchema);
