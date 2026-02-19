import { Schema, model } from 'mongoose';

const galleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: 'Imagen de galería' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model('GalleryImage', galleryImageSchema);
