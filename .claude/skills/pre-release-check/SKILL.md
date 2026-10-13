---
name: pre-release-check
description: Checklist previo a un release o PR hacia main — lint, tests, build, auditoría de dependencias y verificaciones de higiene del repo. Usar antes de abrir o mergear un PR, o al preparar un deploy.
---

# pre-release-check

Verificación **sin efectos secundarios sobre producción**. No hagas deploy, seed, migraciones ni requests a producción, no hagas commits y no imprimas valores de secretos.

## Regla de evidencia
Un paso es **Verificado** solo si ejecutaste el comando en esta sesión y viste su resultado (código de salida y resumen). Si un comando no existe o no se puede ejecutar, el paso queda **No verificado** y lo decís explícitamente. No presentes como "verde" lo que no corriste.

## Pasos

Ejecutá cada uno e informá el resultado real:

1. **Estado del repo:** `git status --short` (árbol limpio o cambios esperados) y rama actual. Si falla por "dubious ownership", usá `git -c safe.directory=<ruta>` sin tocar la config global.
2. **Higiene de secretos:**
   - `git ls-files` filtrando `.env*`, `*.pem`, `*.key`: solo `.env.example` debe aparecer (si aparece `client/.env.local`, anotalo como deuda conocida).
   - Los cambios del PR no agregan secretos (revisá el diff).
3. **Lint:** no hay ESLint configurado todavía. Si no existe un script `lint` en `package.json` ni `eslint.config.*`, marcá **Lint: No verificado (no configurado)**. Si existe, corré `npm run lint` en cada paquete.
4. **Tests cliente:** `npm test` en `client/` (Vitest). Reportá archivos y tests pasados/fallidos.
5. **Tests servidor:** `npm test` en `server/` (Vitest + mongodb-memory-server). Reportá archivos y tests pasados/fallidos.
6. **Build:** `npm run build` en la raíz (equivale al build de `client/`). Reportá si terminó bien y los tamaños de los chunks más grandes.
7. **Dependencias:** `npm audit --omit=dev` en `client/` y `server/`; reportá conteos por severidad y compará con el release anterior si lo conocés.
8. **Config de deploy:** leé `vercel.json` (raíz y `client/`): rewrites correctos, y qué headers de seguridad faltan.
9. **Documentación:** si el cambio altera variables de entorno, actualizá `server/.env.example` y `README.md` (informá, no edites si esta skill corre en modo solo lectura).

## Salida

| Paso | Estado (Verificado / Falló / No verificado) | Comando | Resultado |
|---|---|---|---|

Después:
- **Bloqueantes:** fallas que impiden el release, con archivo:línea si aplica.
- **Advertencias:** deuda o riesgos que no bloquean.
- **No verificado:** lo que no se pudo comprobar y por qué (lint no configurado, producción, navegador, Vercel, etc.).

Recordatorio de flujo: un PR por tema, con lint, tests y build en verde antes de pedir revisión.
