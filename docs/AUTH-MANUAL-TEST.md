# Checklist de prueba manual — sesión por cookie (preview)

Hacerlo en el **preview de Vercel** de la rama `feat/admin-cookie-auth`, antes de mergear a producción.
Usar una ventana de incógnito y DevTools abierto (Application / Network). Anotar fecha, URL del preview y
quién lo probó.

## Preparación
- [ ] El preview tiene `JWT_SECRET`, `MONGODB_URI_PREVIEW` y `CLIENT_URL` (o se acepta el mismo host).
- [ ] Hay un usuario admin en la base de **preview** (no la de producción).

## Login
- [ ] `/admin/login` carga sin errores en consola y sin pedir `/api/auth/me` antes de entrar a `/admin`.
- [ ] Credenciales incorrectas → mensaje de error, sin redirección ni cookie.
- [ ] Credenciales correctas → entra al dashboard.
- [ ] Application › Cookies: existe `ps_admin_session` con **HttpOnly ✓, Secure ✓, SameSite=Strict, Path=/api**
      y vencimiento a la hora configurada en `JWT_EXPIRES_IN`.
- [ ] En la consola, `document.cookie` **no** muestra `ps_admin_session`.
- [ ] Application › Local Storage: **no** hay `admin_token` ni `admin_user`.
- [ ] Network › respuesta de `POST /api/auth/login`: el cuerpo **no** trae `token`.

## Sesión
- [ ] Recargar `/admin/...` mantiene la sesión (se ve `GET /api/auth/me` → 200).
- [ ] Abrir una pestaña nueva en `/admin/dashboard` entra sin pedir login.
- [ ] Las llamadas del panel (productos, pedidos, presupuestos, ajustes) funcionan; las de escritura
      (crear/editar/borrar) responden 2xx y llevan el header `X-Requested-With`.
- [ ] Subir una imagen (producto o proyecto) funciona (multipart con la cookie).
- [ ] Cambiar la contraseña propia funciona y vuelve a pedir login con la nueva.

## Logout y vencimiento
- [ ] "Cerrar sesión" vuelve al login y la cookie desaparece.
- [ ] Atrás del navegador no muestra el panel (pide login).
- [ ] Con dos pestañas abiertas: cerrar sesión en una → la otra redirige al login en su próxima acción.
- [ ] Borrar la cookie a mano y navegar en el panel → vuelve al login (sin quedar en blanco).

## Seguridad
- [ ] Un `curl` con `Authorization: Bearer <token viejo>` a `/api/auth/me` → **401**.
- [ ] Un `POST` autenticado sin `X-Requested-With` (p. ej. con `curl` y la cookie) → **403**.
- [ ] Un `POST` con `Origin: https://ejemplo-malicioso.test` → **403**.
- [ ] Una página HTML de otro dominio con un `<form method=post action="…/api/categories">` no logra crear
      nada estando logueado (SameSite + guard).

## Sitio público (regresión)
- [ ] Navegar el sitio público no dispara `/api/auth/me` ni ningún 401 en la consola.
- [ ] Enviar un presupuesto y un pedido por WhatsApp sigue funcionando sin el header CSRF.
- [ ] El carrito conserva sus productos (usa `localStorage`, no la sesión).

## Después de desplegar a producción
- [ ] Los administradores tienen que volver a iniciar sesión (esperado: las sesiones viejas dejan de valer).
- [ ] Revisar los logs de Vercel por `403` o `401` inesperados durante la primera hora.
