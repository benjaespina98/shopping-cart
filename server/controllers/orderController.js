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

  // Merge duplicated lines from the cart to avoid discounting stock twice for same product row.
  const quantityByProduct = new Map();
  for (const item of items) {
    const productId = String(item.productId || '');
    const quantity = Number(item.quantity || 0);
    if (!productId || quantity <= 0) continue;
    quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity);
  }

  const productIds = Array.from(quantityByProduct.keys());
  const products = await Product.find({ _id: { $in: productIds }, active: true });
  const productById = new Map(products.map((product) => [String(product._id), product]));

  // Verify products, stock, and build items with current prices.
  const orderItems = [];
  let total = 0;

  for (const [productId, quantity] of quantityByProduct.entries()) {
    const product = productById.get(productId);
    if (!product) continue;

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
    }

    const orderItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url || '',
    };

    orderItems.push(orderItem);
    total += product.price * quantity;
  }

  if (orderItems.length === 0) {
    res.status(400);
    throw new Error('Ningún producto válido encontrado');
  }

  // Build WhatsApp message
  const lines = orderItems.map(
    (item, index) => `${index + 1}. ${item.name}\n   Cantidad: ${item.quantity}\n   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}`
  );
  const storeName = process.env.STORE_NAME || 'Playa y Sol';
  const whatsappMessage = [
    '\u{1F44B} \u00A1Hola!',
    `\u{1F3EA} *${storeName}*`,
    'Quiero realizar este pedido:',
    '',
    '\u{1F6D2} *Detalle del pedido*',
    lines.join('\n\n'),
    '',
    `\u{1F4B0} *Total: $${total.toLocaleString('es-AR')}*`,
    '',
    'Gracias \u{1F64C}',
  ].join('\n');

  // Atomic per-product stock decrement with conditional check.
  const discounted = [];
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.product,
        active: true,
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updated) {
      // Roll back previous decrements if any product no longer has stock due to concurrent purchase.
      await Promise.all(
        discounted.map((entry) =>
          Product.findByIdAndUpdate(entry.productId, { $inc: { stock: entry.quantity } })
        )
      );
      res.status(409);
      throw new Error(`No se pudo reservar stock para "${item.name}". Probá nuevamente.`);
    }

    discounted.push({ productId: item.product, quantity: item.quantity });
  }

  let order;
  try {
    order = await Order.create({
      items: orderItems,
      total,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      whatsappMessage,
    });
  } catch (error) {
    await Promise.all(
      discounted.map((entry) =>
        Product.findByIdAndUpdate(entry.productId, { $inc: { stock: entry.quantity } })
      )
    );
    throw error;
  }

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
