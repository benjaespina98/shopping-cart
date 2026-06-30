import { Schema, model } from 'mongoose';

const projectSchema = new Schema(
  {
    title:     { type: String, required: true, trim: true },
    location:  { type: String, required: true, trim: true },
    imageUrl:  { type: String, default: '' },
    publicId:  { type: String, default: '' },
    featured:  { type: Boolean, default: false },
    isHero:    { type: Boolean, default: false },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model('Project', projectSchema);
