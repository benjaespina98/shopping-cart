# Shopping Cart MERN

E-commerce liviano para un local comercial, construido con React, Node, Express y MongoDB. Incluye catálogo público, carrito persistente, checkout por WhatsApp y un panel de administración con productos, pedidos, métricas, logs y configuración.

## Resumen

Este proyecto fue pensado para un caso real de negocio:

- navegación rápida y responsive para clientes
- carga y gestión de productos con imágenes
- flujo de compra simple que termina en WhatsApp
- panel admin para operar el negocio desde cualquier dispositivo
- despliegue full stack en Vercel

## Tecnologías

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Toastify
- Recharts

### Backend

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Cloudinary
- JWT para autenticación
- Multer para uploads

### Infraestructura

- Vercel para frontend y backend
- MongoDB Atlas para persistencia
- Cloudinary para almacenamiento de imágenes

## Funcionalidades principales

### Cliente

- landing page con productos destacados
- listado de productos con búsqueda y filtros
- detalle de producto con galería de imágenes
- carrito persistente en `localStorage`
- envío del pedido a WhatsApp con el detalle armado automáticamente
- sección de contacto y ubicación

### Administrador

- login protegido con JWT
- dashboard con resumen general
- métricas y gráficos de ventas/pedidos
- CRUD de productos con subida y borrado de imágenes
- gestión de pedidos y estados
- logs de auditoría
- configuración general del sitio

## Vista general del proyecto

```text
shopping-cart/
├── client/                  # Frontend React + Vite
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   └── ...
│       └── services/
└── server/                  # Backend Express + MongoDB
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    └── utils/
```

## Requisitos previos

- Node.js 18 o superior
- npm
- cuenta de MongoDB Atlas
- cuenta de Cloudinary
- variables de entorno configuradas

## Instalación local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd shopping-cart
```

### 2. Instalar dependencias

```bash
npm run install:all
```

### 3. Configurar variables de entorno

Crear y completar `server/.env`.

```env
MONGODB_URI_DEVELOPMENT=mongodb+srv://<user>:<pass>@<cluster>/<db_dev>
MONGODB_URI_PREVIEW=mongodb+srv://<user>:<pass>@<cluster>/<db_test>
MONGODB_URI_PRODUCTION=mongodb+srv://<user>:<pass>@<cluster>/<db_prod>

JWT_SECRET=una_clave_larga_y_segura

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

STORE_NAME=Nombre de tu tienda
WHATSAPP_NUMBER=549XXXXXXXXXX

ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=TuPasswordSeguro123!

APP_ENV=development
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Levantar el proyecto en local

### Backend + frontend juntos

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

### Solo frontend

```bash
npm run dev:client
```

### Solo backend

```bash
npm run dev:server
```

## Scripts disponibles

### Raíz del proyecto

- `npm run dev` - levanta backend y frontend juntos
- `npm run dev:open` - levanta solo frontend y abre navegador
- `npm run dev:full:open` - levanta backend + frontend y abre navegador
- `npm run build` - build del frontend
- `npm run build:vercel` - build pensado para despliegue en Vercel
- `npm run seed` - carga datos iniciales de ejemplo

### Frontend

- `npm --prefix client run dev`
- `npm --prefix client run build`
- `npm --prefix client run preview`

### Backend

- `npm --prefix server run dev`
- `npm --prefix server run start`
- `npm --prefix server run seed`

## Entornos y bases de datos

El backend resuelve automáticamente a qué MongoDB conectarse según el entorno:

- `production` → `MONGODB_URI_PRODUCTION`
- `preview` / `testing` → `MONGODB_URI_PREVIEW`
- `development` → `MONGODB_URI_DEVELOPMENT`

Regla práctica:

- si trabajás local, usá una URI de testing/desarrollo
- si desplegás en Vercel producción, usá la URI de productivo
- si desplegás preview/testing, usá la URI de testing

## Endpoints principales

### Públicos

- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/:id`
- `POST /api/orders`

### Admin

- `GET /api/products/admin/all`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/stock`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`
- `GET /api/metrics/summary`
- `GET /api/metrics/orders-over-time`
- `GET /api/metrics/top-products`
- `GET /api/metrics/categories`
- `GET /api/logs`

## Flujo de compra

1. El cliente agrega productos al carrito.
2. El carrito se mantiene persistente en `localStorage`.
3. Al confirmar, el frontend llama a `POST /api/orders`.
4. El backend guarda el pedido y construye el mensaje de WhatsApp.
5. El usuario es redirigido a WhatsApp con el pedido listo para enviar.

## Deploy en Vercel

El proyecto está preparado para desplegar frontend y backend en Vercel.

### Variables de entorno en Vercel

Configurar en Project Settings > Environment Variables:

```env
MONGODB_URI_PRODUCTION=...
MONGODB_URI_PREVIEW=...
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

## Estado del proyecto

Proyecto activo y optimizado para uso real, con foco en:

- velocidad de carga
- experiencia de usuario simple
- administración clara
- compatibilidad con Vercel
- escalabilidad básica sobre MongoDB Atlas

## Notas

- No subir credenciales reales al repositorio.
- Para producción, cada entorno debe apuntar a su propia base de datos.
- Si querés adaptar el branding, revisá el nombre del local, WhatsApp, colores y textos públicos.

Notas:
- `CLIENT_URL` acepta múltiples orígenes separados por coma.
- En este proyecto, producción está pensada para Vercel full stack: frontend y API en el mismo dominio (`/api`).
- `VITE_API_URL` solo se recomienda para pruebas locales o entornos de desarrollo específicos.
- La API bloquea conexiones en `preview/testing` si no existe `MONGODB_URI_PREVIEW` (o `MONGODB_URI_TEST`) para evitar que Preview toque la base de producción.
- Definí variables por entorno en Vercel:
    - `Production`: `MONGODB_URI_PRODUCTION`
    - `Preview`: `MONGODB_URI_PREVIEW`
    - `Development`: la que uses local (`MONGODB_URI_DEVELOPMENT`)
