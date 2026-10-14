import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { writeAuditLog } from '../utils/auditLogger.js';
import { hasControlChars } from '../utils/validation.js';
import { isHoneypotTripped, recordHoneypotHit } from '../utils/antiSpam.js';

const PHONE_RE = /^[\d\s()+-]{6,30}$/;
const MAX_ORDER_LINES = 50;
const MAX_LINE_QUANTITY = 999;

// Valida los datos que manda el visitante en POST /api/orders. Nombre y teléfono son
// opcionales (el carrito hoy solo manda items). Devuelve { customerName, customerPhone } o
// { error }.
export const parseOrderBody = (body) => {
  const input = body && typeof body === 'object' ? body : {};

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: 'No hay productos en el carrito' };
  }
  if (input.items.length > MAX_ORDER_LINES) {
    return { error: `El carrito supera el máximo de ${MAX_ORDER_LINES} productos distintos.` };
  }
  for (const item of input.items) {
    const quantity = Number(item?.quantity);
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.productId !== 'string' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_LINE_QUANTITY
    ) {
      return { error: 'Hay un producto del carrito con datos no válidos.' };
    }
  }

  const customer = {};
  for (const [field, label, max] of [
    ['customerName', 'El nombre', 150],
    ['customerPhone', 'El teléfono', 30],
  ]) {
    const raw = input[field];
    if (raw !== undefined && raw !== null && typeof raw !== 'string') {
      return { error: `${label} no es válido.` };
    }
    const value = (raw || '').trim();
    if (value.length > max) {
      return { error: `${label} es demasiado largo (máximo ${max} caracteres).` };
    }
    if (hasControlChars(value)) {
      return { error: `${label} contiene caracteres no permitidos.` };
    }
    customer[field] = value;
  }
  if (customer.customerPhone && !PHONE_RE.test(customer.customerPhone)) {
    return { error: 'Ingresá un teléfono válido.' };
  }

  return customer;
};

// POST /api/orders — público (se llama cuando el usuario hace click en WhatsApp)
export const createOrder = asyncHandler(async (req, res) => {
  const parsed = parseOrderBody(req.body);
  if (parsed.error) {
    res.status(400);
    throw new Error(parsed.error);
  }
  const { items } = req.body;
  const { customerName, customerPhone } = parsed;

  // Validate WhatsApp configuration
  const whatsappNumber = (process.env.WHATSAPP_NUMBER || '').trim();
  if (!whatsappNumber) {
    res.status(500);
    throw new Error('WhatsApp number not configured. Contact support.');
  }
  if (!/^\d+$/.test(whatsappNumber)) {
    res.status(500);
    throw new Error('Invalid WhatsApp number format. Must contain only digits.');
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
  const products = await Product.find({ _id: { $in: productIds }, active: true })
    .select('name price stock images active')
    .lean();
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

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Honeypot: se responde igual que un éxito real, sin tocar el stock ni guardar el pedido.
  if (isHoneypotTripped(req.body)) {
    recordHoneypotHit('orders');
    const fake = new Order({ items: orderItems, total, customerName, customerPhone, whatsappMessage }).toObject();
    fake.createdAt = new Date();
    fake.updatedAt = fake.createdAt;
    fake.__v = 0;
    res.status(201).json({ order: fake, whatsappUrl });
    return;
  }

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
      customerName,
      customerPhone,
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

  await writeAuditLog({
    req,
    action: 'ORDER_CREATED',
    entity: 'order',
    entityId: order._id,
    message: 'Pedido creado y enviado a WhatsApp',
    meta: {
      total,
      itemsCount: orderItems.length,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
    },
  });

  res.status(201).json({
    order,
    whatsappUrl,
  });
});

// GET /api/orders — admin
export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .populate('items.product', 'name')
    .lean();

  res.json({ orders, total });
});

const ORDER_STATUSES = ['whatsapp_sent', 'confirmed', 'cancelled'];

// PATCH /api/orders/:id/status — admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // findByIdAndUpdate no corre los validadores del schema salvo que se pidan
  // explícitamente: sin esto, cualquier string llegaba a la base tal cual y
  // quedaba un pedido con un estado que las métricas (que comparan contra
  // 'confirmed'/'cancelled'/'whatsapp_sent') ya no reconocían.
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Estado inválido. Debe ser uno de: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }

  await writeAuditLog({
    req,
    action: 'ORDER_STATUS_UPDATED',
    entity: 'order',
    entityId: order._id,
    message: `Estado actualizado a ${status}`,
    meta: { status },
  });

  res.json(order);
});

// DELETE /api/orders/:id — admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }

  await order.deleteOne();

  await writeAuditLog({
    req,
    action: 'ORDER_DELETED',
    entity: 'order',
    entityId: order._id,
    message: `Pedido eliminado (estado previo: ${order.status})`,
  });

  res.json({ message: 'Pedido eliminado' });
});
