import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// GET /api/metrics/summary — admin
export const getSummary = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalProducts, activeProducts, outOfStock, totalOrders, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ active: true }),
    Product.countDocuments({ stock: 0, active: true }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  const statusSummary = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
  ]);

  const statusMap = statusSummary.reduce((acc, entry) => {
    acc[entry._id] = entry;
    return acc;
  }, {});

  const confirmedOrders = statusMap.confirmed?.orders || 0;
  const pendingOrders = statusMap.whatsapp_sent?.orders || 0;
  const cancelledOrders = statusMap.cancelled?.orders || 0;
  const totalRevenue = statusMap.confirmed?.revenue || 0;
  const pendingRevenue = statusMap.whatsapp_sent?.revenue || 0;

  const soldItemsResult = await Order.aggregate([
    { $match: { status: 'confirmed' } },
    { $unwind: '$items' },
    { $group: { _id: null, totalItemsSold: { $sum: '$items.quantity' } } },
  ]);

  const recentRevenueResult = await Order.aggregate([
    {
      $match: {
        status: 'confirmed',
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const recentRevenue = recentRevenueResult[0]?.total || 0;
  const totalItemsSold = soldItemsResult[0]?.totalItemsSold || 0;
  const averageOrderValue = confirmedOrders > 0 ? totalRevenue / confirmedOrders : 0;
  const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;

  res.json({
    totalProducts,
    activeProducts,
    outOfStock,
    totalOrders,
    recentOrders,
    confirmedOrders,
    pendingOrders,
    cancelledOrders,
    totalRevenue,
    pendingRevenue,
    recentRevenue,
    totalItemsSold,
    averageOrderValue,
    confirmationRate,
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
        confirmedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0],
          },
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
          },
        },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'whatsapp_sent'] }, 1, 0],
          },
        },
        revenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, '$total', 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
});

// GET /api/metrics/top-products — admin
export const getTopProducts = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { status: 'confirmed' } },
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
