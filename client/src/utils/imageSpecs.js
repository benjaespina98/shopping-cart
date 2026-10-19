// Tamaños y anchos de srcset de las fotos de cada sección. Viven acá (y no repetidos en cada página)
// porque los usa también utils/routePrefetch.js para calentar la caché del navegador: si no pide
// EXACTAMENTE el mismo candidato que va a pintar la página, la descarga se hace dos veces.
// (El hero de la home tiene su propia copia en public/prefetch.js, con test de sincronía.)
export const SERVICE_PHOTO = { sizes: '(max-width: 767px) calc(100vw - 40px), 540px', widths: [400, 560, 800, 1080], width: 1200 };
export const PROJECT_PHOTO = { sizes: '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 50vw, 360px', widths: [360, 540, 720, 1080], width: 1200 };
export const ABOUT_PHOTO = { sizes: '(max-width: 767px) calc(100vw - 40px), 540px', widths: [400, 560, 800, 1080], width: 1200 };
export const CONTACT_PHOTO = { sizes: '(max-width: 767px) calc(100vw - 40px), 340px', widths: [340, 520, 700], width: 1200 };
export const PRODUCT_CARD_PHOTO = { sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px', widths: [320, 480, 640], width: 640 };
