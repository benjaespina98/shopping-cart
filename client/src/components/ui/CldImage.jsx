import { useState } from 'react';
import { cldOptimized, cldSrcSet, cldPlaceholder } from '../../utils/cloudinary';

// Imagen de Cloudinary con blur-up, formato/calidad automáticos y srcset responsive.
//
// Por qué existe: hasta ahora sólo `design-system/Photo` optimizaba las URLs. El resto
// del sitio (tarjetas de producto, carrito, listados del admin) pintaba `<img src={url}>`
// con la URL cruda: el navegador descargaba el original de 800–1400 px en JPG/PNG para
// mostrarlo en una tarjeta de 300 px. Eso es lo que se percibía como "la foto tarda en
// aparecer". Acá pedimos el ancho real de uso con f_auto/q_auto (WebP/AVIF) y mientras
// tanto mostramos un placeholder difuminado de ~1 KB, así el hueco nunca queda gris.
//
// El componente se dibuja al 100% del contenedor: el que llama define el tamaño y el
// aspect-ratio, para que nunca haya salto de layout.
export default function CldImage({
  src,
  alt = '',
  width = 600,
  sizes,
  srcSetWidths,
  priority = false,
  className = '',
  imgStyle,
  fallback = null,
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) return fallback;

  const srcSet = sizes ? cldSrcSet(src, srcSetWidths) : undefined;
  const placeholder = cldPlaceholder(src);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {placeholder && !loaded && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(12px)', transform: 'scale(1.1)',
          }}
        />
      )}
      <img
        src={cldOptimized(src, width)}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // En minúscula a propósito: React 18 no conoce `fetchPriority` en camelCase y lo
        // descarta con un warning, así que la pista de prioridad nunca llegaba al
        // navegador. En minúscula la pasa tal cual al DOM.
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={className}
        style={{
          position: 'relative',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 400ms ease-out',
          ...imgStyle,
        }}
      />
    </div>
  );
}
