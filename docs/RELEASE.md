# Flujo de release

1. Trabajar en una rama propia; `git status` limpio. Nada va directo a `main` (protegida por un ruleset de GitHub).
2. En verde: `npm run lint`, `npm --prefix client test`, `npm --prefix server test`, `npm run build`.
3. `security-reviewer` (obligatorio) sobre `git diff origin/develop...HEAD`; sin hallazgos Alta/Crítica.
4. `git push -u origin <rama>` y `gh pr create --base develop` con el cuerpo **inline** (o un archivo generado
   en un directorio temporal; nunca una ruta arbitraria ni `.env*`: `--body-file` publica el contenido).
5. Esperar el CI (`gh pr checks <n> --watch`) y mergear con **merge commit** (nunca squash/rebase/`--admin`).
6. Antes del PR a `main`: confirmar con el dueño que hay un **backup reciente** de la base (`mongodump`); no
   se ejecuta desde el flujo. Se pide en cada release.
7. Revisar con `security-reviewer`, `ux-a11y-reviewer` y `seo-perf-reviewer` el diff
   `git diff origin/main...origin/develop` (lo que va a producción); Alto o Crítico bloquea. Adjuntar al PR.
8. Abrir el PR `develop → main`. **No se mergea** hasta que el dueño escriba exactamente
   `MERGEAR A MAIN #<número> <sha7>`; se verifica que el número sea ese PR (develop → main, abierto) y que
   el sha7 sea el HEAD actual de `develop`. Si no coincide, se aborta. Merge con `--match-head-commit`.
9. Post-deploy (solo GET/HEAD): estado del deployment en Vercel (Ready) y
   `curl.exe -sI https://playaysol.vercel.app/` y `.../robots.txt`. No usar `commits/main/status`.
10. Esperado: `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`,
    `content-security-policy-report-only` y `strict-transport-security`; `robots.txt` como `text/plain`.
11. A mano (dueño): login de admin, imágenes del catálogo, un presupuesto de prueba, consola (CSP).
12. Rollback: Vercel › Deployments › deployment anterior › **Promote to Production**. Si hay que revertir
    código: `git revert -m 1 <merge-commit>` en una rama aparte, por PR. Para volver a aplicar el release,
    **revertir ese revert** (`git revert <sha-del-revert>`), también por PR.
13. No mergear nada más a `main` hasta que el revert esté en `main`. La base de datos no se revierte (backup).
14. Prohibido: push a `main` (y variantes `+`, `--force`, `--delete`), `gh api` con métodos de escritura,
    deploy manual (`vercel --prod`) y el seed contra producción.
15. Las reglas de `.claude/settings.json` (`deny`/`ask`) **ayudan** a cumplirlo; son de patrón y eludibles
    (ver `docs/PERMISSIONS.md`). La barrera definitiva es el ruleset. Flujo: `.claude/skills/release-flow/SKILL.md`.
