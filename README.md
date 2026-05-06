# MERN E-commerce (WhatsApp Checkout)

E-commerce liviano orientado a negocios reales, con catálogo, carrito persistente, generación de pedidos y panel administrativo con métricas y auditoría.

## Demo
https://playaysol.vercel.app/

## Stack
Frontend: React 18, Vite, Tailwind CSS, React Router  
Backend: Node.js, Express, MongoDB (Mongoose), JWT  
Infraestructura: Vercel, MongoDB Atlas, Cloudinary  

## Funcionalidades
- Catálogo con búsqueda y filtros  
- Detalle de producto con imágenes  
- Carrito persistente (localStorage)  
- Generación de pedidos y envío a WhatsApp  
- Panel admin (CRUD de productos, pedidos, métricas, logs)  

## Arquitectura
client/ → SPA en React  
server/ → API REST en Express  

## Run local
npm run install:all  
npm run dev  

Frontend: http://localhost:5173  
API: http://localhost:5000/api  

## Flujo
1. Usuario agrega productos al carrito  
2. Se genera el pedido vía API  
3. Backend construye el mensaje  
4. Redirección a WhatsApp  

## Deploy
Full stack en Vercel con variables de entorno por ambiente.

## Estado
Proyecto activo, enfocado en simplicidad, rendimiento y uso real.
