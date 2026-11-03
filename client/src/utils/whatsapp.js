// Enlaces de WhatsApp del sitio. Antes cada componente armaba su propio `https://wa.me/${número}`
// sin mensaje: quien tocaba el botón llegaba a un chat vacío, sin contexto, y el número del admin
// (texto libre) entraba sin sanear a la URL.

export const WHATSAPP_GREETING = 'Hola! Quiero consultar por una piscina.';

// Mensaje inicial según la sección desde la que se escribe: quien atiende sabe de qué se trata.
const CONTEXT_MESSAGES = {
  '/servicios': 'Hola! Estuve viendo sus servicios y quiero hacer una consulta.',
  '/proyectos': 'Hola! Vi los proyectos que realizaron y quiero consultar por una piscina.',
  '/tienda': 'Hola! Quiero consultar por productos de la tienda.',
  '/nosotros': WHATSAPP_GREETING,
  '/presupuesto': 'Hola! Quiero pedir un presupuesto.',
  '/contacto': WHATSAPP_GREETING,
};

export function whatsappMessageFor(pathname = '/') {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return CONTEXT_MESSAGES[clean] || WHATSAPP_GREETING;
}

// `number` viene de la configuración del panel (texto libre): se dejan solo los dígitos.
export function whatsappUrl(number, text = WHATSAPP_GREETING) {
  const digits = String(number ?? '').replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
