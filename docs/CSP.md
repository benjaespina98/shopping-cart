# Content-Security-Policy

Definida en `vercel.json` (bloque `headers` para `/(.*)`). Desde `feat/csp-enforce` se **aplica** como
`Content-Security-Policy` (antes era `Content-Security-Policy-Report-Only`).

| Directiva | Valor | Qué lo justifica en el código |
|---|---|---|
| `default-src` | `'self'` | Base restrictiva |
| `script-src` | `'self' https://www.googletagmanager.com` | Bundle propio y `/prefetch.js`; gtag solo si hay `VITE_GA_MEASUREMENT_ID` (`client/src/utils/analytics.js:12`) |
| `style-src` | `'self' https://fonts.googleapis.com` | CSS compilado en `/assets`; hoja de Google Fonts (`client/index.html`). Los `style={{}}` de React se aplican por CSSOM y no los bloquea |
| `font-src` | `'self' https://fonts.gstatic.com` | Archivos de las fuentes de Google |
| `img-src` | `'self' data: blob: https://res.cloudinary.com https://*.google-analytics.com https://www.googletagmanager.com` | Cloudinary (`utils/cloudinary.js`); `data:` para placeholders y QR (`heroFallback.js`, `AdminSettings.jsx` `QRCode.toDataURL`); `blob:` para vistas previas del admin (`useImagePicker.js`, `AdminProducts.jsx` `createObjectURL`); balizas de GA |
| `connect-src` | `'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com` | API same-origin `/api` (`services/api.js`); GA |
| `frame-src` | `https://www.google.com` | Mapa embebido de `Contact.jsx` |
| `manifest-src` | `'self'` | `/site.webmanifest` |
| `worker-src` | `'self'` | No hay workers hoy; explícito para que no caiga a `default-src` |
| `object-src` / `base-uri` / `form-action` / `frame-ancestors` | `'none'` / `'self'` / `'self'` / `'none'` | Sin plugins; sin `<base>` ajeno; los formularios no postean a terceros; el sitio no se enmarca |

## Qué rompería la política (no hay usos hoy)
- Un `<style>` o atributo `style="..."` en HTML parseado, un `<script>` inline o `eval`/`new Function`.
- Imágenes de hosts no listados. Los datos demo del seed usan `https://placehold.co` (`server/scripts/seed.js`): se
  bloquean en `img-src`; solo afecta a bases de desarrollo/preview sembradas.
- Un `fetch` a otro dominio, un iframe distinto de Google Maps, o GA con funciones que usen `stats.g.doubleclick.net` o
  `www.google.com/g/collect` (no listados; no se agregan sin evidencia de uso).
- Un Web Worker con `blob:` (`worker-src 'self'` lo bloquea).

## Cómo cambiarla
1. Agregar un origen solo con el archivo y la línea del código que lo usa; actualizar este documento y el test
   `client/src/vercelConfig.test.js` (lista cerrada de orígenes).
2. Para probar sin desplegar: build local y servirlo con el header; abrir la consola y buscar
   `Refused to ...` o escuchar `securitypolicyviolation`.

## Verificado y no verificado
- Verificado en un navegador real con la CSP **aplicada** (build local, API real, sin GA): rutas públicas, iframe de Maps y
  8 pantallas del panel, sin violaciones.
- No verificado: gtag con un ID real (endpoints de GA más allá de los listados), gráfico de Recharts con datos, QR descargado,
  vista previa `blob:` con un archivo real, y el comportamiento en Safari/Firefox.
- Reversión rápida: volver la clave a `Content-Security-Policy-Report-Only` en `vercel.json` (por PR) o promover el
  deployment anterior en Vercel.
