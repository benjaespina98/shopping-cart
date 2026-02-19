import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// GET /api/metrics/summary — admin
export const getSummary = asyncHandler(async (req, res) => {
  const [totalProducts, activeProducts, outOfStock, totalOrders, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ active: true }),
    Product.countDocuments({ stock: 0, active: true }),
    Order.countDocuments(),
    Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  res.json({
    totalProducts,
    activeProducts,
    outOfStock,
    totalOrders,
    recentOrders,
    totalRevenue,
  });
});

// GET /api/metrics/orders-over-time — admin
export const getOrdersOverTime = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
});

// GET /api/metrics/top-products — admin
export const getTopProducts = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
  ]);

  res.json(data);
});

// GET /api/metrics/categories — admin
export const getCategoryStats = asyncHandler(async (req, res) => {
  const data = await Product.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json(data);
});
