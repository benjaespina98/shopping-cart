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

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
// Additional indexes for performance
orderSchema.index({ customerPhone: 1 }); // For finding orders by phone
orderSchema.index({ status: 1 }); // For filtering by status alone

const Order = mongoose.model('Order', orderSchema);
export default Order;
