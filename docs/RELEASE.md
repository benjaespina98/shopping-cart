# Flujo de release

1. Trabajar en una rama propia desde `develop`; `git status` limpio. Nada va directo a `main`.
2. En verde: `npm run lint`, `npm --prefix client test`, `npm --prefix server test`, `npm run build`.
3. Revisión de los agentes `security-reviewer` (obligatorio), `ux-a11y-reviewer` y `seo-perf-reviewer`
   sobre `git diff origin/develop...HEAD`. Sin hallazgos Alta/Crítica.
4. `git push -u origin <rama>` y `gh pr create --base develop` con el cuerpo estándar (resumen, tabla de
   checks, plan de rollback).
5. Esperar el CI (`gh pr checks <n> --watch`) y mergear con **merge commit** (nunca squash/rebase).
6. `git fetch origin develop:develop` y abrir el PR `develop → main`. **No se mergea** hasta que el dueño
   escriba exactamente `MERGEAR A MAIN`.
7. Al mergear a `main`, Vercel despliega solo. Esperar el estado `success` del commit.
8. Post-deploy (solo GET/HEAD): `curl.exe -sI https://playaysol.vercel.app/` y `.../robots.txt`.
9. Esperado: `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`,
   `content-security-policy-report-only` y `strict-transport-security` presentes; `robots.txt` como `text/plain`.
10. A mano (dueño): login de admin, imágenes del catálogo, un presupuesto de prueba y la consola del navegador
    (violaciones de CSP).
11. Rollback: Vercel › Deployments › deployment anterior › **Promote to Production**; luego
    `git revert -m 1 <merge>` por el flujo normal. La base de datos no se revierte (usar el backup).
12. Prohibido: push a `main`, `--force`, deploy manual (`vercel --prod`), correr el seed contra producción.
13. Los permisos que lo hacen cumplir están en `.claude/settings.json` (`deny`, `allow`, `ask`).
14. La automatización completa del flujo está en la skill `.claude/skills/release-flow/SKILL.md`.
15. Procedimiento de prueba de la sesión por cookie en preview: `docs/AUTH-MANUAL-TEST.md`.
