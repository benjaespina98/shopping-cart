import axios from 'axios';

const isProduction = import.meta.env.PROD;
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const initialBaseUrl = isProduction ? '/api' : configuredApiUrl || '/api';

const api = axios.create({
  baseURL: initialBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config || {};

    // If an external API URL is configured but unavailable (e.g. paused Render), retry once on same-origin /api.
    const shouldFallbackToLocalApi =
      !isProduction &&
      configuredApiUrl &&
      configuredApiUrl !== '/api' &&
      !originalConfig._localApiRetried &&
      (err.code === 'ERR_NETWORK' || !err.response);

    if (shouldFallbackToLocalApi) {
      originalConfig._localApiRetried = true;
      originalConfig.baseURL = '/api';
      return api.request(originalConfig);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Products ────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  getById: (id) => api.get(`/products/${id}`),
  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (formData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Orders ──────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// ─── Metrics ─────────────────────────────────────────────
export const metricsAPI = {
  getSummary: () => api.get('/metrics/summary'),
  getOrdersOverTime: (days) => api.get('/metrics/orders-over-time', { params: { days } }),
  getTopProducts: () => api.get('/metrics/top-products'),
  getCategoryStats: () => api.get('/metrics/categories'),
};

// ─── Gallery ─────────────────────────────────────────────
export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  add: (formData) =>
    api.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  reorder: (items) => api.put('/gallery/reorder', { items }),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export default api;
