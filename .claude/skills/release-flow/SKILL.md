---
name: release-flow
description: Flujo de publicación de este repo — rama → PR a develop → PR develop → main (que solo se mergea con la frase exacta "MERGEAR A MAIN") → checklist post-deploy y rollback. Usar para subir cambios o preparar un release a producción.
---

# release-flow

Producción es la rama `main` y Vercel despliega **solo al mergear a `main`**. Por eso nada va directo a
`main`: ni push, ni force push, ni deploy manual. Reportá cada paso con el comando ejecutado y su
resultado real; lo que no pudiste comprobar va a **No verificado**.

## Reglas duras
- Nunca `git push` a `main` (está denegado en `.claude/settings.json`), nunca `--force`, nunca `vercel deploy`.
- Nunca `squash` ni `rebase` al mergear: siempre merge commit (`gh pr merge --merge`).
- Nunca leer `.env*`, correr el seed ni imprimir tokens o secretos.
- No cambies de rama con trabajo sin commitear ni uses `git switch` para medir otras ramas
  (ver CLAUDE.md). Para actualizar `develop` sin checkout: `git fetch origin develop:develop`.
- El PR `develop → main` **se abre pero no se mergea** hasta que el usuario escriba exactamente
  `MERGEAR A MAIN`.

## 0. Requisitos
1. `gh --version` y `gh auth status` (el token no se imprime). Si falta `gh` o no hay sesión, parate y
   dá los pasos manuales: instalar desde https://cli.github.com y correr `gh auth login`.
2. `git status --short` vacío y rama actual distinta de `main`.

## 1. Condiciones de subida (todo en verde, si no, no se sube)
| Check | Comando |
|---|---|
| Lint | `npm run lint` (0 errores) |
| Tests client | `npm --prefix client test` |
| Tests server | `npm --prefix server test` |
| Build | `npm run build` |
| Hooks | sin bloqueos de `.claude/hooks/*` durante el trabajo |
| Seguridad | agente **security-reviewer** sobre `git diff origin/develop...HEAD`: sin hallazgos Alta/Crítica |

Además, sobre el mismo diff: **ux-a11y-reviewer** (si toca `client/`) y **seo-perf-reviewer**
(si toca `index.html`, rutas, imágenes o dependencias del cliente). Registrá sus hallazgos en el PR.
Si algo falla: no subas; reportá la causa y el comando que lo reproduce.

## 2. Rama → develop
```bash
git push -u origin <rama>                       # nunca main
gh pr create --base develop --head <rama> --title "<convencional>" --body-file <cuerpo.md>
gh pr checks <n> --watch                        # esperar CI en verde
gh pr merge <n> --merge                         # merge commit, nunca squash/rebase
git fetch origin develop:develop                # actualizar develop local sin checkout
```

## 3. develop → main (se abre, NO se mergea)
```bash
gh pr create --base main --head develop --title "release: <fecha o resumen>" --body-file <cuerpo.md>
gh pr checks <n>
```
Devolvé la URL y esperá la frase exacta `MERGEAR A MAIN`. Con la frase:
```bash
gh pr merge <n> --merge
gh api repos/{owner}/{repo}/commits/main/status --jq '.state'   # esperar "success" (deploy de Vercel)
```

## 4. Checklist post-deploy (solo GET/HEAD a producción)
```powershell
curl.exe -sI https://playaysol.vercel.app/
curl.exe -sI https://playaysol.vercel.app/robots.txt
```
| Ítem | Esperado |
|---|---|
| `/` → status | `200` |
| `x-content-type-options` | `nosniff` |
| `x-frame-options` | `DENY` |
| `referrer-policy` | `strict-origin-when-cross-origin` |
| `permissions-policy` | presente (camera, microphone, geolocation, payment, usb vacíos) |
| `content-security-policy-report-only` | presente |
| `strict-transport-security` | presente (lo agrega Vercel) |
| `/robots.txt` → status y `content-type` | `200` y `text/plain` (no `text/html`) |

Quedan a cargo del dueño y se anotan como **No verificado**: login del admin, imágenes del catálogo,
envío de un presupuesto de prueba y violaciones de CSP en la consola del navegador.

## 5. Rollback
1. Vercel › Project › Deployments › elegir el último deployment **Ready** anterior › `⋯` › **Promote to
   Production** (o *Instant Rollback*). No requiere push ni build.
2. Después, en git: `git revert -m 1 <merge-commit>` en una rama nueva y PR a `develop` → `main` por el
   flujo normal, para que el repo coincida con producción.
3. El rollback **no revierte la base de datos**; para eso está el backup hecho antes del release. La
   cookie de sesión del panel invalida las sesiones al desplegar y al volver atrás: hay que reingresar.

## Cuerpo estándar del PR
```markdown
## Resumen
<qué cambia y por qué, 3–5 líneas>

## Checks
| Check | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | |
| Tests client | `npm --prefix client test` | |
| Tests server | `npm --prefix server test` | |
| Build | `npm run build` | |
| security-reviewer | diff `origin/develop...HEAD` | Alta/Crítica: 0 |

## Plan de rollback
Promover el deployment anterior desde Vercel (Deployments › Promote to Production) y revertir el merge
commit con `git revert -m 1 <sha>`.

## No verificado
<lo que no se pudo comprobar>
```
