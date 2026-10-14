import axios from 'axios';

const isProduction = import.meta.env.PROD;
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const initialBaseUrl = isProduction ? '/api' : configuredApiUrl || '/api';

// Nota: NO fijamos un Content-Type por defecto. axios pone application/json
// automáticamente para bodies de objeto, y para FormData deja que el navegador
// arme el multipart CON boundary. Fijar 'application/json' acá rompía los uploads:
// axios serializaba el FormData a JSON y descartaba el archivo; y fijar
// 'multipart/form-data' a mano lo enviaba sin boundary ("Boundary not found").
//
// Autenticación: la sesión del panel vive en una cookie httpOnly que emite el server (el
// JavaScript no la ve ni la guarda). `withCredentials` hace que el navegador la mande; el
// header X-Requested-With es la segunda capa anti-CSRF que el server exige en los métodos que
// cambian estado (ver server/middleware/csrf.js).
const api = axios.create({
  baseURL: initialBaseUrl,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

// Estas rutas "sondean" la sesión: un 401 ahí es una respuesta esperada, no una sesión vencida
// en medio de una pantalla del panel, así que no debe redirigir.
const AUTH_PROBES = ['/auth/me', '/auth/login', '/auth/logout'];

// Sesión vencida en el panel: volver al login
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config || {};

    // If an external API URL is configured but unavailable, retry once on same-origin /api.
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

    const path = window.location.pathname;
    if (
      err.response?.status === 401 &&
      !AUTH_PROBES.includes(originalConfig.url) &&
      path.startsWith('/admin') &&
      path !== '/admin/login'
    ) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── Products ────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (formData) =>
    api.post('/products', formData),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Categories ──────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── Orders ──────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ─── Metrics ─────────────────────────────────────────────
export const metricsAPI = {
  getSummary: () => api.get('/metrics/summary'),
  getOrdersOverTime: (days) => api.get('/metrics/orders-over-time', { params: { days } }),
};

// ─── Settings ────────────────────────────────────────────
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAdmin: () => api.get('/settings/admin'),
  updateAdmin: (data) => api.put('/settings/admin', data),
  uploadContactPhoto: (formData) =>
    api.post('/settings/contact-photo', formData),
  uploadAboutPhoto: (formData) =>
    api.post('/settings/about-photo', formData),
  getUsers: () => api.get('/settings/users'),
  createUser: (data) => api.post('/settings/users', data),
  changeOwnPassword: (data) => api.put('/settings/users/me/password', data),
  deleteUser: (id) => api.delete(`/settings/users/${id}`),
};

// ─── Projects (sitio web) ────────────────────────────────
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  create: (formData) =>
    api.post('/projects', formData),
  update: (id, formData) =>
    api.put(`/projects/${id}`, formData),
  reorder: (items) => api.put('/projects/reorder', { items }),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ─── Logs ───────────────────────────────────────────────
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
};

// ─── Services (sitio web) ────────────────────────────────
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/admin'),
  create: (formData) =>
    api.post('/services', formData),
  update: (id, formData) =>
    api.put(`/services/${id}`, formData),
  reorder: (items) => api.put('/services/reorder', { items }),
  delete: (id) => api.delete(`/services/${id}`),
};

// ─── Quotes (presupuesto) ────────────────────────────────
export const quotesAPI = {
  create: (data) => api.post('/quotes', data),
  getAll: () => api.get('/quotes'),
  updateStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
};

export default api;
