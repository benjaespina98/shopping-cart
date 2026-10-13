---
name: security-audit
description: Auditoría de seguridad de solo lectura del repo (dependencias, secretos, headers, formularios, XSS, rutas admin). Usar cuando se pida auditar la seguridad o antes de un release.
---

# security-audit

Auditoría **de solo lectura**. No modifiques archivos, no hagas commits, no ejecutes deploys, seed ni nada contra producción, y **nunca imprimas valores de secretos**: reportá archivo y línea.

## Regla de evidencia
Un hallazgo o un control solo se marca **Verificado** si lo respaldan un comando que ejecutaste en esta sesión (con su resultado) o un archivo y línea que leíste. Lo demás va a **No verificado**. Si un comando falla, reportá el error real; no lo reemplaces por una suposición.

## Pasos

1. **Dependencias** (cada comando, por paquete):
   - `npm audit --omit=dev` en `server/` y en `client/`. Reportá conteos por severidad y los paquetes directos. Anotá si hay fix disponible dentro del rango semver.
   - `npm outdated` en ambos, para majors y paquetes deprecados.
2. **Secretos en el árbol** (nunca imprimas el valor):
   - `git ls-files` y filtrá `.env*`, `*.pem`, `*.key`: solo `.env.example` debería estar versionado.
   - `git grep -nIE` con patrones de URI con credenciales (`mongodb(\+srv)?://[^ ]+:[^@ ]+@`), claves privadas (`BEGIN .*PRIVATE KEY`), `sk_live_`, `AKIA...`, y asignaciones a `password|secret|token|api_key`. Mostrá solo `archivo:línea`, o la línea con el valor enmascarado.
   - Contraseñas o secretos con fallback literal (`process.env.X || '...'`).
3. **Historial git:** `git log --all -p` filtrado con los mismos patrones; reportá commit y archivo, nunca el valor. Si hay candidatos, decí que deben verificarse a mano y rotarse si eran reales.
4. **Headers:** leé `vercel.json` (raíz y `client/`). Listá los que faltan entre CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`/`X-Frame-Options`. No hagas requests a producción.
5. **Servidor** (leer `server/app.js`, `server/routes/*`, `server/controllers/*`, `server/middleware/*`, `server/utils/mailer.js`):
   - Cada ruta que no es GET público tiene `protect` y `adminOnly`.
   - Mass assignment, validación server-side (tipos, formato, longitud), rate limit y anti-spam en formularios públicos.
   - Config del JWT (secreto, expiración, algoritmo) y dónde se guarda en el cliente.
   - Subida de archivos (multer): tamaño, MIME, cantidad, destino.
   - Mailer: saneado de CR/LF en `to`, `subject`, `replyTo`; HTML escapado.
   - Handler de errores: sin `stack` ni mensajes internos en producción.
6. **Cliente:** `grep` de `dangerouslySetInnerHTML|innerHTML|eval\(|new Function|document\.write`; `target="_blank"` sin `rel` con `noopener`/`noreferrer`; scripts de terceros en `client/index.html`.
7. **Tests:** `npm test` en `client/` y en `server/` (reportá resultado real).

## Salida
Tabla ordenada por severidad:

| Severidad | Categoría | Archivo:línea | Descripción | Impacto | Corrección | Evidencia |
|---|---|---|---|---|---|---|

Después, dos listas cortas:
- **Verificado:** cada ítem con el comando o el archivo que lo respalda.
- **No verificado:** lo que no pudiste comprobar y por qué (producción real, runtime, navegador, acceso a Vercel o a la base, herramientas no instaladas).
