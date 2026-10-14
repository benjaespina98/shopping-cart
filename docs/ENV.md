# Variables de entorno

Referencia de todas las variables que lee el código, por entorno, y la política para manejarlas.
Los archivos de plantilla son [`server/.env.example`](../server/.env.example) y
[`client/.env.example`](../client/.env.example); no contienen valores reales.

Entornos: **Production** y **Preview** (Vercel) y **Local** (tu máquina). `VERCEL_ENV` lo pone
Vercel y tiene prioridad sobre `APP_ENV` y `NODE_ENV` para decidir la base de datos
(`server/config/env.js`).

## Matriz por entorno

Leyenda: ✅ debe estar seteada · ⚪ opcional · ❌ no setear · 🔑 marcar Sensitive en Vercel ·
"≠" = valor distinto en cada entorno.

### Servidor (`server/`)

| Variable | Production | Preview | Local | Secreto | Notas |
|---|---|---|---|---|---|
| `JWT_SECRET` | ✅ ≠ 🔑 | ✅ ≠ 🔑 | ✅ | Sí | La app no arranca sin ella en Production/Preview (`assertRequiredEnv`). |
| `JWT_EXPIRES_IN` | ⚪ | ⚪ | ⚪ | No | Por defecto `7d`. También es el `Max-Age` de la cookie de sesión del panel (ver `docs/adr/0001-admin-session-cookie.md`). |
| `MONGODB_URI_PRODUCTION` | ✅ 🔑 | ❌ | ❌ | Sí | Solo Production. |
| `MONGODB_URI_PREVIEW` | ❌ | ✅ ≠ 🔑 | ⚪ | Sí | Obligatoria en Preview; base distinta de producción. |
| `MONGODB_URI_DEVELOPMENT` | ❌ | ❌ | ✅ | Sí | Base de desarrollo. |
| `MONGODB_URI` (legacy) | ❌ | ❌ | ❌ | Sí | Es fallback de producción y desarrollo: puede apuntar a la base equivocada. |
| `MONGODB_URI_TEST` (legacy) | ❌ | ❌ | ❌ | Sí | Alias de `MONGODB_URI_PREVIEW`. |
| `CLOUDINARY_CLOUD_NAME` | ✅ | ✅ ≠ | ✅ | No | Aparece en las URLs públicas. Requerida en Production/Preview. |
| `CLOUDINARY_API_KEY` | ✅ 🔑 | ✅ ≠ 🔑 | ✅ | Semi | Requerida en Production/Preview. |
| `CLOUDINARY_API_SECRET` | ✅ 🔑 | ✅ ≠ 🔑 | ✅ | Sí | Permite subir y borrar imágenes. |
| `CLIENT_URL` | ✅ | ✅ (patrón `*`) | ⚪ | No | Orígenes CORS. En Production no se acepta `localhost`. |
| `WHATSAPP_NUMBER` | ✅ | ✅ | ✅ | No | Sin ella, `POST /api/orders` responde 500. |
| `STORE_NAME` | ⚪ | ⚪ | ⚪ | No | Por defecto "Playa y Sol Piscinas". |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` | ✅ | ❌ | ❌ | No | Sin SMTP, la consulta se guarda y solo se omite el email. |
| `SMTP_PASS` | ✅ 🔑 | ❌ | ❌ | Sí | |
| `QUOTE_NOTIFY_EMAIL` | ✅ | ❌ | ❌ | No | Destino de las notificaciones. |
| `ADMIN_EMAIL` | ❌ | ❌ | ⚪ | No | Solo el seed; obligatorio y con formato de email válido, sin valor por defecto. Ver "ADMIN_PASSWORD". |
| `ADMIN_PASSWORD` | ❌ | ❌ | ⚪ | Sí | Solo el seed, local, contra una base de desarrollo. Mínimo 12 caracteres. |
| `SEED_ENV` | ❌ | ❌ | ⚪ | No | Solo el seed; puede redirigirlo a otra base. |
| `NODE_ENV` | (lo pone Vercel) | (lo pone Vercel) | `development` | No | No setear a mano en Vercel. |
| `APP_ENV` | ❌ | ❌ | ⚪ | No | En Vercel manda `VERCEL_ENV`. |
| `VERCEL_ENV` | (sistema) | (sistema) | ❌ | No | La define Vercel; nunca a mano. |
| `PORT` | ❌ | ❌ | ⚪ | No | Por defecto 5000. |

### Cliente (`client/`) — todas públicas

| Variable | Production | Preview | Local | Notas |
|---|---|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | ✅ | ⚪ vacía | ⚪ vacía | Sin ella no se carga analytics. |
| `VITE_WHATSAPP_NUMBER` | ⚪ | ⚪ | ⚪ | Valor inicial hasta que carga la configuración del servidor. |
| `VITE_API_URL` | ❌ | ❌ | ⚪ | Se ignora en builds de producción (`src/services/api.js:5`): usa `/api`. |
| `VITE_API_PROXY_TARGET` | ❌ | ❌ | ⚪ | Solo el dev server (`client/vite.config.js`). |

Las `VITE_*` van incrustadas en el bundle: **no son secretas** y marcarlas Sensitive no cambia eso.
Nunca pongas un secreto con prefijo `VITE_`.

### Sobre `ADMIN_PASSWORD`

El servidor en ejecución **no** la lee: solo `server/scripts/seed.js` (vía `resolveAdminCredentials`).
El login compara contra el hash bcrypt guardado en la base, y el cambio de contraseña desde el panel
(`PUT /api/settings/users/me/password`) escribe ese hash. El mínimo de 12 caracteres lo aplican el modelo `User`, el alta de administradores y el cambio de contraseña (`MIN_PASSWORD_LENGTH`); las cuentas ya creadas no se ven afectadas porque solo se valida al modificar la contraseña. Por eso no debe existir en Vercel: no la
necesita ninguna ruta, y tenerla ahí solo agrega un secreto más para filtrar. Si se rota la contraseña
en la base, un valor viejo en el entorno no la pisa.

## Tests

`startTestApp()` (`server/tests/helpers.js`) vacía `SMTP_*`, `QUOTE_NOTIFY_EMAIL` y `CLOUDINARY_*`, igual que las URIs de Mongo: un `server/.env` con credenciales reales no hace que los tests manden mails ni toquen Cloudinary (verificado en `server/tests/mailerIsolation.test.js`).

## CI

`.github/workflows/vercel-build-check.yml` corre en PRs a `main` y `develop` y ejecuta `npm audit --omit=dev --audit-level=critical` en `client/` y `server/`.

## Política

1. **Un secreto distinto por entorno.** Production, Preview y Local no comparten `JWT_SECRET`,
   credenciales de base de datos, de Cloudinary ni de SMTP. Un token o una base de Preview jamás
   debe servir en Production.
2. **Bases separadas.** `MONGODB_URI_PRODUCTION` solo existe en Production. Preview y Local usan
   usuarios y bases propias, con permisos mínimos.
3. **Sensitive para secretos.** En Vercel, marcar como Sensitive todo lo marcado 🔑 arriba. Después
   no se puede leer el valor desde el panel: para cambiarlo hay que reemplazarlo.
4. **Mínimo necesario.** Una variable que ningún código de runtime usa no se carga en Vercel.
5. **Nada de secretos en el repo, el bundle ni los logs.** Los `.env` reales están ignorados
   (`.env`, `*.local`); los `.env.example` llevan solo `CHANGE_ME`.
6. **Los cambios en Vercel necesitan un nuevo deploy** (y las `VITE_*`, un nuevo build).
7. **Generar secretos con un generador aleatorio**, no a mano:
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

## Rotación

| Secreto | Cómo rotarlo | Efecto |
|---|---|---|
| `JWT_SECRET` | Generar uno nuevo, reemplazarlo en el entorno y redeployar. | Cierra todas las sesiones de admin. |
| Base de datos | Crear usuario nuevo en Atlas, actualizar la URI, redeployar y borrar el usuario viejo. | Sin corte si se hace en ese orden. |
| `CLOUDINARY_API_SECRET` | Regenerar la API key en Cloudinary, actualizar y redeployar. | Las subidas fallan hasta el deploy. |
| `SMTP_PASS` | Emitir una app password nueva, actualizar y redeployar. | Los emails se omiten hasta el deploy. |
| Contraseña de admin | Cambiarla desde el panel (Configuración). | Solo la base; no depende de ninguna variable. |

Rotar cada ~90 días y siempre que alguien con acceso deje el proyecto.

## Si se filtra un secreto

1. **Revocar primero, investigar después**: rotar el secreto (tabla anterior) y redeployar. Borrar el
   archivo o el commit no alcanza: lo ya publicado debe darse por comprometido.
2. Si es `JWT_SECRET`, asumir que pudieron firmarse tokens de admin; la rotación los invalida.
3. Si es de la base, revisar en Atlas los accesos recientes y los logs de actividad; cambiar también
   las contraseñas de los usuarios admin de la app si hubo acceso a la colección `users`.
4. Si es de Cloudinary, revisar si hubo subidas o borrados inesperados.
5. Revisar el historial de git (`git log -p -S<patrón>`) para ver desde cuándo y dónde estuvo, sin
   pegar el valor en tickets ni chats.
6. Dejar registro: qué se filtró, cuándo, cómo se rotó y qué cambió para que no se repita.

> Pendiente conocido: el historial del `README.md` tiene asignaciones `JWT_SECRET=` que no parecen
> placeholders (commits `3841be0` y `a9340e8`). Si alguna coincidió con un valor real, rotarlo.
