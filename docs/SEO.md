# SEO técnico

Qué hay, de dónde sale cada dato y qué limitaciones tiene. El sitio es una SPA (CSR): los
rastreadores que ejecutan JavaScript ven los metadatos por ruta; los scrapers de redes sociales
solo leen el `index.html` estático (los de la home).

## Archivos

| Archivo | Qué es |
|---|---|
| `client/public/robots.txt` | Permite todo, `Disallow: /admin`, `Sitemap:` con URL absoluta. |
| `client/public/sitemap.xml` | Las 7 rutas públicas de `App.jsx`, URLs absolutas, sin `lastmod` inventado. |
| `client/public/site.webmanifest` | Nombre y colores tomados de los tokens (`--teal-700`, `--sand-50`). |
| `client/src/seo/pageMeta.js` | Título y description por ruta. Fuente única del hook y de los tests. |
| `client/src/hooks/usePageMeta.js` | Actualiza `title`, `description`, canonical, `og:*` y `robots` por ruta. |
| `client/src/pages/NotFound.jsx` | Ruta comodín con `noindex` y enlace a la home. |
| `client/index.html` | canonical, `og:url`, `theme-color`, manifest y JSON-LD de la home. |

Al agregar una ruta pública: `App.jsx`, `PAGE_META`, `sitemap.xml`. Un test (`src/seo.test.jsx`)
falla si no coinciden.

## Datos del JSON-LD (LocalBusiness)

Solo datos que ya existen en el código del sitio:

| Propiedad | Origen |
|---|---|
| `name`, `url`, `logo`, `image` | `index.html` y `public/brand/logo-stacked.png` |
| `telephone`, `email` | `DEFAULT_SETTINGS` en `SettingsContext.jsx` |
| `address` (Corrientes 1210, Villa María, Córdoba, AR) | `LOCATION` en `Contact.jsx` |
| `geo` | Coordenadas de la URL del mapa en `Contact.jsx` |
| `sameAs` | Enlaces a Instagram, Facebook y TikTok en `Contact.jsx` |

**Omitido a propósito:** horarios (`openingHoursSpecification`), `priceRange`, `aggregateRating`,
`review`. Los horarios, el teléfono y el email son editables desde el panel y el JSON-LD es
estático: si el dueño los cambia, el bloque queda desactualizado. Ver la sección "Pendientes".

## Rewrites y archivos estáticos

`vercel.json` usa `rewrites` (`/(.*)` → `/index.html`). La documentación de Vercel indica que
"se da precedencia al filesystem antes de aplicar los rewrites" (vercel.com/docs/project-configuration/vercel-json,
sección Rewrites). Por eso `/robots.txt`, `/sitemap.xml`, `/site.webmanifest` y `/prefetch.js`,
presentes en `client/dist`, se sirven como archivos. Evidencia local: el bundle `/assets/*.js` ya
se sirve por el mismo mecanismo en producción.

## Limitaciones

- **El status HTTP de una ruta inexistente sigue siendo 200** (la SPA devuelve `index.html`). Lo que
  evita su indexación es el meta `noindex`. Un 404 real requiere SSR/prerender o una lista de rutas
  en `vercel.json`.
- `robots.txt` bloquea `/admin`, así que los rastreadores no llegan a leer su `noindex`; es el
  comportamiento habitual y la ruta igual no tiene contenido público.
- El manifest usa `favicon.png` (748×748) y `favicon.svg`; no hay íconos 192/512 ni maskable.
- Los títulos/descriptions por ruta los ve Google al renderizar JS; WhatsApp, Facebook y X leen
  siempre los de la home (`index.html`).

## Pendientes (decisión del dueño)

- Confirmar los horarios actuales para sumarlos al JSON-LD (o sacarlos de la web si cambian seguido).
- Confirmar que el teléfono, el email y las coordenadas son los que se quieren publicar en datos
  estructurados.
- Imagen `og:image` en 1200×630 (hoy es el logo apilado 1032×840).
- Si se quiere 404 real: prerender de las rutas públicas.
