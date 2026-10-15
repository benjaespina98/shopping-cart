# ADR 0001 — Sesión del panel de administración en cookie httpOnly

- **Estado:** aceptada (implementada en la rama `feat/admin-cookie-auth`, pendiente de desplegar)
- **Fecha:** 2026-10-14

## Contexto

El login del panel devolvía el JWT en el cuerpo de la respuesta y el cliente lo guardaba en
`localStorage` (`admin_token`), enviándolo en el header `Authorization: Bearer`. Cualquier script que
corra en la página (un XSS, una dependencia comprometida) puede leer `localStorage` y robar una sesión
de administrador válida por 7 días. Además, la CSP del sitio hoy está en modo *report-only*, así que no
hay una segunda barrera.

## Decisión

1. **El JWT viaja solo en una cookie** `ps_admin_session` emitida por el server en `POST /api/auth/login`:
   `HttpOnly`, `SameSite=Strict`, `Path=/api`, `Max-Age` igual a la expiración del JWT y `Secure`
   en producción y preview (no en desarrollo local sin HTTPS). El cuerpo de la respuesta ya no trae el token.
2. **Un solo camino de autenticación:** el middleware `protect` lee la cookie y **deja de aceptar**
   `Authorization`.
3. **Protección CSRF en rutas autenticadas** (`POST/PUT/PATCH/DELETE`): se exige el header
   `X-Requested-With: XMLHttpRequest` y, si el request trae `Origin` (o `Referer`), debe ser un origen de
   la allowlist `CLIENT_URL` o el mismo host que sirve la API. Se responde `403` con un mensaje genérico.
   No aplica a las rutas públicas (presupuesto, pedido, contacto).
4. **CORS:** se mantiene la allowlist; el origen se refleja solo si está permitida (o es el mismo host),
   nunca `*`, y con `credentials: true`. Un origen ajeno recibe `403`.
5. **Cliente:** no guarda nada. `AuthContext` pregunta a `GET /api/auth/me` quién es (solo en rutas
   `/admin`), el logout llama a `POST /api/auth/logout` y al cargar se borran las claves viejas
   `admin_token` / `admin_user` de `localStorage`.
6. **Expiración sin cambios:** la define `JWT_EXPIRES_IN` (por defecto `7d`). La cookie usa ese mismo valor.

## Alternativas descartadas

- **Seguir con `localStorage` y reforzar la CSP:** reduce el riesgo pero no lo elimina; el token seguiría
  legible por cualquier script permitido.
- **Token CSRF sincronizado (double submit):** más pesado. Con `SameSite=Strict` y mismo origen, el header
  personalizado más la verificación de `Origin` alcanzan; se puede sumar si algún día la API vive en otro sitio.
- **`cookie-parser`:** una dependencia más en la ruta de autenticación para parsear una sola cookie.
  Se escribió un parser mínimo (`server/utils/cookies.js`); para escribir se usa `res.cookie` de Express.
- **Sesiones en base de datos / revocación:** fuera de alcance; ver consecuencias.

## Consecuencias

**Positivas**
- Un XSS ya no puede leer el token de sesión (`document.cookie` no lo expone).
- Los requests cross-site no llevan la cookie (`SameSite=Strict`) y, además, fallan el guard CSRF.
- Un token filtrado (logs, historial) ya no sirve en el header `Authorization`.

**Negativas / a tener en cuenta**
- **Todas las sesiones existentes se invalidan al desplegar** (el server ya no acepta el token viejo): los
  administradores tienen que volver a iniciar sesión. Es esperado.
- **El logout no revoca el JWT** (es *stateless*): quita la cookie del navegador, pero un token copiado antes
  seguiría válido hasta que expire. Mitigación: expiración corta o rotar `JWT_SECRET` ante una filtración.
- **API y cliente deben compartir origen.** Hoy es así (Vercel sirve el SPA y reescribe `/api/*` a la
  función). Si la API pasara a otro origen, la cookie `SameSite=Strict` y `Path=/api` no se enviarían y el
  panel dejaría de autenticar; habría que pasar a `SameSite=None; Secure`, un token CSRF real y configurar
  la URL base de la API (hoy el build de producción usa `/api` fijo).
- Una cookie `Secure` exige HTTPS; en desarrollo local se omite el flag.
- Un `Origin: null` (iframes con sandbox, `file://`) se rechaza en rutas autenticadas.

## Implementación

`server/config/session.js`, `server/middleware/authMiddleware.js`, `server/middleware/csrf.js`,
`server/config/origins.js`, `server/utils/cookies.js`, `server/controllers/authController.js`;
cliente: `client/src/services/api.js`, `client/src/context/AuthContext.jsx`.
Pruebas: `server/tests/cookieAuth.test.js`, `client/src/context/AuthContext.test.jsx`, `client/src/App.test.jsx`.
