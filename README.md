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
STORE_NAME="Playa y Sol"
WHATSAPP_NUMBER=5493534224607   # Tu número con código de país, sin + ni espacios
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

## Comandos diarios (guía rápida)

Desde la raíz del proyecto:

```bash
npm run dev
```
Levanta backend + frontend en desarrollo.

```bash
npm run dev:open
```
Levanta solo frontend y abre el navegador automáticamente.

```bash
npm run dev:full:open
```
Levanta backend + frontend y abre el navegador automáticamente.

```bash
npm run build
```
Compila el frontend para producción local.

```bash
npm --prefix client run preview
```
Sirve el build compilado del frontend para previsualización local.

```bash
npm run build:vercel
```
Build completo pensado para deploy en Vercel.

Nota: si cerrás el proceso con `Ctrl + C`, es normal ver `exit code 1` en `concurrently`; no implica error de la app.

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

### Full stack en Vercel (frontend + API serverless)

Este repo ya incluye configuración para desplegar todo junto en Vercel:

- Frontend estático desde `client/dist`
- API Express como función serverless en `/api/*`

#### Variables de entorno en Vercel

Configurá estas variables (Project Settings → Environment Variables):

```env
MONGODB_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
STORE_NAME=...
WHATSAPP_NUMBER=...
CLIENT_URL=https://tu-proyecto.vercel.app,http://localhost:5173
```

Notas:
- `CLIENT_URL` acepta múltiples orígenes separados por coma.
- `VITE_API_URL` no es obligatorio en producción si frontend y API están en el mismo dominio (usa `/api` por defecto).

### Opción alternativa

Si preferís mantener backend separado, podés seguir usando Render/Railway y definir `VITE_API_URL` apuntando a esa API externa.
