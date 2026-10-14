# Lint

ESLint 9 con flat config (`eslint.config.js`) en `client/` y `server/`. Desde la raíz:

```bash
npm run lint          # client + server
npm --prefix client run lint
npm --prefix server run lint
```

El CI (`.github/workflows/vercel-build-check.yml`) corre `npm run lint` en cada paquete antes de los
tests, y el build espera a que pasen.

## Criterio

- **Error:** todo lo que hoy pasa limpio. No se puede retroceder; el CI falla.
- **Warn (deuda):** lo que fallaba al introducir el lint. Está en el bloque `DEUDA` de cada
  `eslint.config.js`, con la cantidad medida ese día. No frena el CI.
- Al corregir un caso, bajar el contador del comentario; cuando llegue a 0, pasar la regla a `error`.

## Por qué ESLint 9 y no 10

`eslint-plugin-react` y `eslint-plugin-jsx-a11y` declaran compatibilidad hasta ESLint 9. Subir a 10
queda para cuando los plugins la soporten.

## Deuda al introducir el lint

| Paquete | Regla | Cantidad |
|---|---|---|
| client | `jsx-a11y/click-events-have-key-events` | 15 |
| client | `jsx-a11y/no-static-element-interactions` | 12 |
| client | `react/no-unescaped-entities` | 10 |
| client | `no-unused-vars` | 5 |
| client | `jsx-a11y/no-noninteractive-element-interactions` | 3 |
| client | `jsx-a11y/no-autofocus` | 2 |
| client | `react-hooks/exhaustive-deps` | 2 |
| client | `react/no-unknown-property` | 1 |
| **client** | **total** | **50** |
| server | `no-unused-vars` | 1 |

## Hook de Claude Code

`.claude/hooks/format-edited.sh` lintea solo el archivo editado con `npx --no-install eslint` (sin
`--fix`). Sale con código 2 y muestra la salida si hay **errores**; los warnings no lo bloquean.
