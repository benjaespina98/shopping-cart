import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    total: { type: Number, required: true },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: {
      type: String,
      enum: ['whatsapp_sent', 'confirmed', 'cancelled'],
      default: 'whatsapp_sent',
    },
    whatsappMessage: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
