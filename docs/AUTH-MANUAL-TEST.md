# Checklist de prueba manual — sesión por cookie (preview)

Hacerlo en el **preview de Vercel** de la rama `feat/admin-cookie-auth`, antes de mergear a producción.
Usar una ventana de incógnito y DevTools abierto (Application / Network). Anotar fecha, URL del preview y
quién lo probó.

## Preparación
- [ ] El preview tiene `JWT_SECRET`, `MONGODB_URI_PREVIEW` y `CLIENT_URL` (o se acepta el mismo host).
- [ ] Hay un usuario admin en la base de **preview** (no la de producción). Si no, seguir "Sembrar la base de preview" más abajo.

## Sembrar la base de preview

> **El seed no se corre jamás contra producción.** Crea un administrador y datos de ejemplo. Este
> procedimiento es solo para la base de **preview** (`proyecto0_test`) y se ejecuta desde la máquina
> del dueño, no desde Vercel ni desde un asistente.

### Qué crea el seed (`server/scripts/seed.js`)

| Qué | Cuándo | Detalle |
|---|---|---|
| **Administrador** | Si no existe un usuario con ese `ADMIN_EMAIL` | Nombre "Administrador", rol `admin`, contraseña = `ADMIN_PASSWORD` (se guarda con hash bcrypt). Si el email **ya existe**, no cambia nada: **no actualiza la contraseña**. |
| **3 productos de ejemplo** | Solo si la colección de productos está vacía | "Producto Demo 1", "Producto Demo 2", "Producto Demo 3" (categorías General y Oferta, con imágenes de ejemplo). |
| **4 servicios** | Solo si la colección de servicios está vacía | Piscinas de obra, Reformas, Climatización, Cercos y seguridad. |

Es idempotente: correrlo de nuevo no duplica nada. **No** crea proyectos, categorías, configuración
del sitio, pedidos ni presupuestos.

### Cómo elige la base

1. `SEED_ENV` pisa a `APP_ENV` (el seed lo hace después de leer `server/.env`).
2. Con entorno `preview` usa `MONGODB_URI_PREVIEW` (o, si no existe, `MONGODB_URI_TEST`). Si ninguna está
   definida, **falla** en vez de conectarse a otra base.
3. `server/.env` y las variables de la sesión de PowerShell se combinan: **las de la sesión ganan**.
   Por eso el bloque limpia `VERCEL_ENV` y `APP_ENV` antes de empezar.

### Variables

| Variable | Obligatoria | Quién la define |
|---|---|---|
| `SEED_ENV=preview` | Sí | el bloque de abajo |
| `MONGODB_URI_PREVIEW` | Sí | tu `server/.env` (apunta a `proyecto0_test`) |
| `ADMIN_EMAIL` | Sí (email válido, sin valor por defecto) | te la pide el bloque |
| `ADMIN_PASSWORD` | Sí (mínimo 12 caracteres, sin valor por defecto) | te la pide el bloque, sin mostrarla |

### Comandos (PowerShell)

Pegá **todo el bloque junto**. Está envuelto en `& { ... }`: si cualquier paso falla, se detiene y no
ejecuta los siguientes. La contraseña la escribís en un prompt oculto: no aparece en pantalla, no
queda en el historial de PSReadLine y no se escribe en ningún archivo. Al terminar (o fallar) se borran
las variables.

```powershell
& {
    $ErrorActionPreference = 'Stop'
    Set-Location 'D:\Win10\Desktop\UTN\z\Proyectos\shopping-cart\server'

    try {
        # 1) Estado limpio: nada heredado de la sesión, y entorno = preview
        Remove-Item Env:VERCEL_ENV, Env:APP_ENV, Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
        $env:SEED_ENV = 'preview'

        # 2) Comprobar A QUÉ base apunta ANTES de sembrar.
        #    Imprime entorno, host y nombre de la base; nunca usuario ni contraseña de la URI.
        #    Aborta (código 1) si el entorno es producción o la base no es proyecto0_test.
        node --input-type=module -e "import { loadServerEnv, resolveMongoConnection } from './config/env.js'; loadServerEnv(); if (process.env.SEED_ENV) process.env.APP_ENV = process.env.SEED_ENV; const { uri, label } = resolveMongoConnection(); const u = new URL(uri); const base = u.pathname.replace('/', ''); console.log('entorno:', label); console.log('host   :', u.hostname); console.log('base   :', base || '(sin nombre)'); if (label === 'production' || base !== 'proyecto0_test') { console.error('ABORTAR: no apunta a proyecto0_test.'); process.exit(1); }"
        if ($LASTEXITCODE -ne 0) { throw 'Detenido: el seed NO apunta a proyecto0_test. No se sembró nada.' }

        # 3) Credenciales del admin de preview (la contraseña se escribe sin eco)
        $env:ADMIN_EMAIL = (Read-Host 'ADMIN_EMAIL del admin de preview').Trim()
        $secure = Read-Host 'ADMIN_PASSWORD (minimo 12 caracteres; no se muestra)' -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try { $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

        # 4) Confirmación explícita
        $respuesta = Read-Host "Se va a sembrar 'proyecto0_test' (preview). Escribi SEMBRAR para continuar"
        if ($respuesta -ne 'SEMBRAR') { throw 'Cancelado. No se sembró nada.' }

        # 5) Sembrar
        node scripts/seed.js
        if ($LASTEXITCODE -ne 0) { throw "El seed termino con error (codigo $LASTEXITCODE)." }
    }
    finally {
        # 6) Limpieza: las variables sensibles no quedan en la sesión
        Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL, Env:SEED_ENV -ErrorAction SilentlyContinue
    }
}
```

### Qué tenés que ver

- Paso 2 imprime `entorno: preview` y `base   : proyecto0_test`. Si dice otra cosa, el bloque se corta
  solo; **no sigas** y revisá `MONGODB_URI_PREVIEW` en `server/.env`.
- El seed imprime `MongoDB connected for seeding (preview)...` y, según el caso, `Admin user created`
  o `Admin user already exists`, y termina con `Seed complete!`.
- Si el administrador ya existía y querés otra contraseña, cambiala desde el panel (Configuración) o
  borrá ese usuario en Atlas y volvé a correr el bloque.

### Comprobar el resultado

1. En Atlas › `proyecto0_test` › Browse Collections: `users` (1 admin), `products` (3), `services` (4).
2. Entrar al preview en `/admin/login` con ese email y contraseña y seguir el resto de este checklist.

### Reglas

- **Nunca** cambies `'preview'` por `'production'`, ni corras el seed con `MONGODB_URI_PRODUCTION` a la
  vista. El control del paso 2 existe para cortar ese error, pero no reemplaza tu atención.
- No pegues la contraseña en un comando, en un archivo `.env` del repo, ni en un chat.
- El seed no es un mecanismo de rotación de contraseñas: sirve para crear el primer administrador.

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
