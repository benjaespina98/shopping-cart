import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
productSchema.index({ active: 1, category: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
