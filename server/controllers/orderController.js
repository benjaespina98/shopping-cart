import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// POST /api/orders — público (se llama cuando el usuario hace click en WhatsApp)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customerName, customerPhone } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No hay productos en el carrito');
  }

  // Verify products and build items with current prices
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.active) continue;

    const orderItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0]?.url || '',
    };

    orderItems.push(orderItem);
    total += product.price * item.quantity;
  }

  if (orderItems.length === 0) {
    res.status(400);
    throw new Error('Ningún producto válido encontrado');
  }

  // Build WhatsApp message
  const lines = orderItems.map(
    (i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString('es-AR')}`
  );
  const whatsappMessage = `¡Hola! Me gustaría hacer el siguiente pedido:\n\n${lines.join('\n')}\n\n*Total: $${total.toLocaleString('es-AR')}*`;

  const order = await Order.create({
    items: orderItems,
    total,
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    whatsappMessage,
  });

  res.status(201).json({
    order,
    whatsappUrl: `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`,
  });
});

// GET /api/orders — admin
export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .populate('items.product', 'name');

  res.json({ orders, total });
});

// PATCH /api/orders/:id/status — admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }
  res.json(order);
});
