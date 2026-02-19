# 🛒 MiTienda — MERN Shopping Cart

Aplicación web completa para un local comercial con carrito de compras, integración con WhatsApp y panel de administración.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas |
| Imágenes | Cloudinary |
| Auth | JWT |

---

## Estructura del proyecto

```
shopping-cart/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── layout/       # PublicLayout, AdminLayout, Navbar, Footer
│       │   └── ui/           # ProductCard, CartDrawer
│       ├── context/          # CartContext, AuthContext
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Shop.jsx
│       │   ├── Contact.jsx
│       │   ├── Location.jsx
│       │   └── admin/        # Login, Dashboard, Products, Orders, Metrics
│       └── services/         # api.js (Axios)
└── server/                   # Express backend
    ├── config/               # db.js, cloudinary.js
    ├── controllers/          # auth, products, orders, metrics
    ├── middleware/            # authMiddleware.js
    ├── models/               # User, Product, Order
    ├── routes/               # authRoutes, productRoutes, orderRoutes, metricsRoutes
    └── scripts/              # seed.js
```

---

## Configuración inicial

### 1. Clonar e instalar dependencias

```bash
npm run install:all
```

### 2. Configurar variables de entorno del servidor

```bash
cd server
cp .env.example .env
```

Editá `server/.env` con tus credenciales:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopping_cart
JWT_SECRET=una_clave_muy_secreta_larga
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
WHATSAPP_NUMBER=5491112345678   # Tu número con código de país, sin + ni espacios
ADMIN_EMAIL=admin@mitienda.com
ADMIN_PASSWORD=TuPassword123!
```

### 3. Crear usuario admin y productos de ejemplo

```bash
npm run seed
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api

---

## Rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page del local |
| `/tienda` | Shop con carrito y búsqueda/filtros |
| `/contacto` | Formulario de contacto → WhatsApp |
| `/ubicacion` | Mapa y horarios del local |

## Panel Admin

| Ruta | Descripción |
|------|-------------|
| `/admin/login` | Login con email + contraseña |
| `/admin/dashboard` | Resumen general |
| `/admin/productos` | CRUD productos + upload de imágenes |
| `/admin/pedidos` | Lista de pedidos con estados |
| `/admin/metricas` | Gráficos de revenue, pedidos, categorías |

---

## Personalización

### Nombre del local
Buscá y reemplazá `MiTienda` en los archivos de componentes.

### Número de WhatsApp
Configurá `WHATSAPP_NUMBER` en `server/.env`:
```
WHATSAPP_NUMBER=5491198765432
```
Y actualizá la constante en `client/src/pages/Contact.jsx`.

### Dirección y mapa
Actualizá el objeto `LOCATION` en `client/src/pages/Location.jsx` con tu dirección y coordenadas reales.

### Colores del tema
Editá `client/tailwind.config.js` → sección `colors.brand` con tus colores.

### Redes sociales y email
Editá los links en `client/src/components/layout/Footer.jsx` y `Contact.jsx`.

---

## API Endpoints

### Públicos
```
GET    /api/products           # Listar productos (con filtros)
GET    /api/products/categories # Categorías disponibles
GET    /api/products/:id        # Producto por ID
POST   /api/orders             # Crear pedido (cart → WhatsApp)
```

### Admin (requieren Bearer JWT)
```
GET    /api/products/admin/all  # Todos los productos
POST   /api/products           # Crear producto
PUT    /api/products/:id        # Actualizar producto
PATCH  /api/products/:id/stock  # Actualizar stock
DELETE /api/products/:id        # Eliminar producto

GET    /api/orders             # Listar pedidos
PATCH  /api/orders/:id/status  # Cambiar estado

GET    /api/metrics/summary
GET    /api/metrics/orders-over-time
GET    /api/metrics/top-products
GET    /api/metrics/categories
```

---

## Flujo del carrito → WhatsApp

1. Usuario agrega productos al carrito (persiste en `localStorage`)
2. Abre el drawer del carrito y hace click en **"Enviar pedido por WhatsApp"**
3. El front llama a `POST /api/orders` con los items
4. El server guarda el pedido en MongoDB y retorna un `whatsappUrl`
5. Se abre WhatsApp con el mensaje pre-escrito con el detalle del pedido

---

## Deploy (producción)

### Backend — Railway / Render / VPS
```bash
cd server && npm start
```

### Frontend — Vercel / Netlify
```bash
cd client && npm run build
```
Apuntá el build output a `client/dist/`.

> Para producción, configurá `CLIENT_URL` en el backend y la variable de entorno `VITE_API_URL` si no usás proxy.
