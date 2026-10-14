# Playa & Sol Piscinas — guía para Claude Code

Sitio público + panel admin de una empresa de piscinas (Villa María, Córdoba). Producción: https://playaysol.vercel.app/

## Estructura
- `client/` — SPA React 18 + Vite 5 + Tailwind 3 + React Router 6 (CSR, sin SSR). Tests con Vitest + Testing Library.
- `server/` — API Express 4 + Mongoose 8, JWT, multer + Cloudinary, nodemailer. Tests con Vitest + Supertest + mongodb-memory-server.
- `api/index.js` — entrada serverless de Vercel (reexporta `server/app.js`). `vercel.json` (raíz) define build y rewrites.
- CI: `.github/workflows/vercel-build-check.yml` (tests de client y server + build en PRs a `main`).
- Node `>=22.19.0`. JavaScript puro: **no introducir TypeScript**.

## Comandos (desde la raíz)
- `npm run install:all` — instala raíz, server y client.
- `npm run dev` — server (nodemon) + client (Vite en :5173, proxy `/api` → :5000).
- `npm run build` — build del cliente (`client/dist`). Vercel usa `npm run build:vercel`.
- `npm --prefix client test` / `npm --prefix server test` — suites completas (`vitest run`).
- Un archivo: `npm --prefix client exec vitest run src/pages/Contact.test.jsx`.
- Lint: **todavía no hay ESLint**. Cuando se agregue, `npm run lint` debe cubrir client y server.
- `npm run seed` — **NUNCA contra producción** (ver seguridad). Está denegado en `.claude/settings.json`.

## Convenciones
- ESM (`"type": "module"`), JS/JSX. Textos de UI y comentarios en español rioplatense.
- Cliente: componentes en `client/src/components`, páginas en `pages/` (admin en `pages/admin/`), sistema de diseño en `design-system/` (tokens CSS), estado en `context/`, HTTP en `services/api.js`.
- Imágenes: usar `CldImage`/`utils/cloudinary.js` (transformaciones `f_auto,q_auto` y ancho).
- Tests junto al código (`*.test.jsx`) en el cliente; en `server/tests/` para la API. Cada fix de bug lleva su test.
- Servidor: controllers con `express-async-handler`, errores vía handler global de `server/app.js`; modelos con `maxlength`/`required`.
- Commits convencionales (`feat:`, `fix:`, `chore:`) como el historial existente.

## Checklist de seguridad (aplicar en cada cambio)
- Validación **server-side** de todo input (tipo, formato, longitud); el precio y el total se calculan en el servidor (ver `orderController`).
- Rutas de escritura y de admin con `protect` + `adminOnly`; sin mass assignment (lista blanca de campos).
- Sin secretos en código, logs, tests, README ni bundle del cliente. Variables solo en `.env` (ignorado) y documentadas en `server/.env.example`. Nada con prefijo `VITE_` que sea secreto.
- Sin fallbacks literales de contraseñas o secretos (`process.env.X || '...'`).
- `target="_blank"` siempre con `rel="noopener noreferrer"`.
- Sin `dangerouslySetInnerHTML`/`innerHTML`/`eval` con datos no confiables.
- Headers de seguridad definidos en `vercel.json` (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors).
- Errores sin `stack` ni detalles internos en producción; no loguear tokens ni contraseñas.
- **Jamás** correr seed, migraciones, scripts ni deploys contra producción. Producción usa `MONGODB_URI_PRODUCTION`; desarrollo/preview, sus propias URIs.
- No leer ni editar `.env*` (salvo `.env.example`) ni claves privadas: un hook lo bloquea (Read/Edit/Write y Grep/Glob con `path` o `glob` que los nombren).
- Límite conocido del hook: un `Grep` sobre un directorio sin `glob` puede leer líneas de un `.env`; no hay forma de detectarlo. Excluí `.env*` en el glob y no pongas secretos reales en el árbol.

## Git seguro (reglas duras)
- Nunca cambies de rama con trabajo sin commitear, ni uses `git switch`/`checkout` para medir otras ramas: git borra del disco los archivos que son tracked en una rama y no en la otra (así se perdió `client/.env.local`).
- Para ver o probar otra versión: `git worktree add` en una carpeta fuera del repo y borrala al terminar (`git worktree remove`).
- No borres ni muevas archivos ignorados (`.env.local`, `.env`): no están en git y no se recuperan.

## Flujo de trabajo
- Un PR por tema, desde una rama propia (la base es `main`; `develop` es la rama de trabajo actual).
- Antes de pedir revisión: lint (cuando exista), tests de client y server, y `npm run build` en verde. La skill `pre-release-check` lo automatiza.
- Antes de cambios sensibles: skill `security-audit` o el agente `security-reviewer`. Para UI: `ux-a11y-reviewer`; para metadatos/rendimiento: `seo-perf-reviewer`.
- Reportá siempre qué verificaste (comando + resultado) y qué **no** pudiste verificar.

## Configuración de Claude en este repo
- `.claude/settings.json` — permisos denegados y hooks (`guard-secrets.sh` antes de Read/Edit/Write; `format-edited.sh` lintea el archivo editado si ESLint está instalado).
- `.claude/agents/` — revisores de solo lectura. `.claude/skills/` — `security-audit`, `pre-release-check`.
