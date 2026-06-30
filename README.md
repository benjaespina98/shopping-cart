# Playa & Sol — Sitio institucional + E-commerce (MERN)

Plataforma full-stack para un negocio real de construcción y mantenimiento de piscinas: landing institucional, catálogo de productos con checkout vía WhatsApp, gestión de proyectos/servicios y un panel de administración completo con métricas y auditoría.

**Demo en producción:** https://playaysol.vercel.app/

---

## Stack

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS (admin) + sistema de diseño propio en CSS variables (sitio público) |
| Backend | Node.js, Express, MongoDB / Mongoose, JWT |
| Integraciones | Cloudinary (imágenes), Nodemailer (notificaciones por email), WhatsApp (checkout y consultas) |
| Infraestructura | Vercel (frontend + serverless API), MongoDB Atlas |
| Seguridad | Helmet, rate limiting, sanitización de inputs (`express-mongo-sanitize`), bcrypt, JWT con auditoría de acciones |

---

## Funcionalidades

**Sitio público**
- Landing institucional con secciones dinámicas (hero, métricas de confianza, servicios, proyectos destacados, productos destacados) — todo el contenido es editable desde el panel admin, sin tocar código.
- Catálogo de productos con búsqueda, filtros y carrito persistente (`localStorage`).
- Checkout sin pasarela de pago: arma el pedido, descuenta stock de forma atómica y lo envía por WhatsApp con el detalle.
- Galería de proyectos (obras terminadas) y página de servicios, ambas gestionables desde el admin.
- Formulario de solicitud de presupuesto: guarda la consulta en base de datos, dispara un email de notificación y permite distinguir el tipo de proyecto (sincronizado con los servicios cargados).

**Panel de administración** (`/admin`, protegido con JWT)
- CRUD de productos, servicios y proyectos (con carga de imágenes a Cloudinary).
- Gestión de pedidos y de solicitudes de presupuesto, con cambio de estado.
- Métricas de ventas (productos top, categorías, evolución de pedidos) con gráficos.
- Galería de imágenes para el carrusel del sitio.
- Configuración general (datos de contacto, horarios, número de WhatsApp) y generación de código QR del sitio.
- Log de auditoría: registra acciones sensibles (login, cambios de pedidos, creación de contenido) con usuario y fecha.

---

## Arquitectura

```
shopping-cart/
├── client/            # SPA en React (Vite)
│   └── src/
│       ├── pages/         # Páginas públicas (Landing, Shop, Services, Projects, Quote, Contact...)
│       ├── pages/admin/    # Panel de administración
│       ├── design-system/  # Tokens CSS, Button, Card, Input... (sitio público)
│       ├── components/     # Layout, carrito, galería, WhatsApp flotante
│       ├── context/         # Auth y carrito (Context API)
│       └── services/api.js  # Cliente Axios centralizado
└── server/            # API REST en Express
    ├── models/         # Mongoose: Product, Order, Project, Service, QuoteRequest, Settings, User, AuditLog...
    ├── controllers/    # Lógica de negocio por recurso
    ├── routes/         # Definición de endpoints + middlewares (auth, upload)
    ├── middleware/     # JWT, control de rol admin
    └── utils/          # Auditoría, envío de emails
```

El frontend consume la API vía `services/api.js` (Axios con interceptores de auth y fallback de origen en desarrollo). El backend expone una API REST versionada por recurso bajo `/api`, con rutas públicas (catálogo, servicios, proyectos, presupuesto) y rutas protegidas por JWT + rol admin para el panel.

---

## Cómo correrlo localmente

**Requisitos:** Node.js 18+, una base MongoDB (local o Atlas), credenciales de Cloudinary.

```bash
# 1. Instalar dependencias (raíz, server y client)
npm run install:all

# 2. Configurar variables de entorno
cp server/.env.example server/.env
# completar MONGODB_URI, JWT_SECRET, CLOUDINARY_*, WHATSAPP_NUMBER, etc.

# 3. (Opcional) cargar datos de ejemplo
npm run seed

# 4. Levantar frontend + backend juntos
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

### Variables de entorno relevantes (`server/.env`)

| Variable | Uso |
|---|---|
| `MONGODB_URI_DEVELOPMENT` / `MONGODB_URI_PREVIEW` | Conexión a MongoDB por ambiente |
| `JWT_SECRET` | Firma de tokens de sesión del admin |
| `CLOUDINARY_*` | Almacenamiento de imágenes (productos, servicios, proyectos, galería) |
| `WHATSAPP_NUMBER` | Número que recibe los pedidos de la tienda |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Envío de notificaciones por email (solicitudes de presupuesto) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usuario admin creado por el seed |

---

## Flujo de compra

1. El usuario arma el carrito (persistido en `localStorage`).
2. Al finalizar, el backend valida stock en tiempo real, descuenta cantidades de forma atómica (con rollback si falla algún ítem) y registra el pedido.
3. Se genera el mensaje de WhatsApp con el detalle y el total, y se redirige al cliente al chat del negocio.
4. El pedido queda visible en el panel admin para hacer seguimiento del estado.

---

## Decisiones técnicas destacadas

- **Sin pasarela de pago:** el checkout cierra en WhatsApp, el canal real que usa el negocio — menos fricción y menos superficie de riesgo que integrar un proveedor de pagos para este caso de uso.
- **Contenido editable sin deploy:** servicios, proyectos, galería, métricas de confianza y datos de contacto se gestionan desde el admin y se reflejan en el sitio público al instante.
- **Auditoría real:** las acciones administrativas relevantes quedan registradas (quién, qué, cuándo), no solo logueadas en consola.
- **Reserva de stock atómica:** el descuento de stock usa updates condicionales por producto con rollback ante fallos parciales, para evitar sobreventa en compras concurrentes.
- **Separación de sistemas de diseño:** el sitio público usa tokens CSS propios (paleta de marca, spacing, tipografía) para una identidad consistente; el panel admin usa Tailwind, priorizando velocidad de desarrollo donde el diseño no es cara al cliente.

---

## Deploy

Despliegue full-stack en Vercel (frontend estático + funciones serverless para la API), con MongoDB Atlas como base de datos y variables de entorno separadas por ambiente (development / preview / production).

---

## Estado

Proyecto activo en producción para un negocio real (Playa & Sol Piscinas, Villa María, Argentina), con foco en simplicidad, rendimiento y casos de uso reales antes que en complejidad técnica innecesaria.
