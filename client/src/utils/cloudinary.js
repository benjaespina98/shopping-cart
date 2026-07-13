// Optimización de imágenes de Cloudinary por URL — sin tocar el backend.
// Las URLs se guardan como `https://res.cloudinary.com/<cloud>/image/upload/v123/<...>`.
// Insertamos transformaciones justo después de `/image/upload/` para pedirle a
// Cloudinary formato moderno (WebP/AVIF con f_auto), calidad automática y tamaños
// responsive. Cualquier URL que no sea de Cloudinary se devuelve sin tocar.

const UPLOAD_SEGMENT = '/image/upload/';

export function isCloudinary(url) {
  return typeof url === 'string' && url.includes(UPLOAD_SEGMENT);
}

// Inserta una cadena de transformación en la URL de Cloudinary.
export function cldUrl(url, transform) {
  if (!isCloudinary(url) || !transform) return url;
  const [head, tail] = url.split(UPLOAD_SEGMENT);
  return `${head}${UPLOAD_SEGMENT}${transform}/${tail}`;
}

// Versión optimizada a un ancho concreto (formato y calidad automáticos).
export function cldOptimized(url, width = 1200) {
  return cldUrl(url, `f_auto,q_auto,w_${width}`);
}

// srcset responsive: el navegador elige el ancho según viewport y densidad.
export function cldSrcSet(url, widths = [480, 768, 1024, 1400]) {
  if (!isCloudinary(url)) return undefined;
  return widths
    .map((w) => `${cldUrl(url, `f_auto,q_auto,w_${w}`)} ${w}w`)
    .join(', ');
}

// Placeholder blur-up: imagen minúscula y muy comprimida (~1 KB) para mostrar
// difuminada mientras carga la definitiva. Sin salto de layout.
export function cldPlaceholder(url) {
  return cldUrl(url, 'w_32,e_blur:800,q_1,f_auto');
}
