import { isAllowedOrigin, isSameHostOrigin } from '../config/origins.js';

// Protección CSRF para rutas autenticadas por cookie.
//
// La cookie de sesión es SameSite=Strict, que ya impide que otro sitio la mande. Esta es la
// segunda capa (defensa en profundidad) para los métodos que cambian estado:
//   1. Header personalizado X-Requested-With: un formulario HTML de otro origen no puede
//      agregarlo, y un fetch/XHR cross-origin necesita un preflight CORS que la allowlist
//      rechaza.
//   2. Si el request trae Origin (o, en su defecto, Referer), tiene que ser un origen
//      permitido o el mismo host que sirve la API.
// No se aplica a las rutas públicas (presupuesto, pedido, contacto), que no usan la cookie.

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const CSRF_HEADER = 'x-requested-with';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';

const forbidden = () => {
  // Mensaje genérico a propósito: no dice si falló el header o el origen.
  const error = new Error('Solicitud no permitida');
  error.statusCode = 403;
  return error;
};

const originOf = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const isAcceptableOrigin = (origin, req) => isAllowedOrigin(origin) || isSameHostOrigin(origin, req);

export const csrfGuard = (req, res, next) => {
  if (!UNSAFE_METHODS.has(req.method)) return next();

  if (req.get(CSRF_HEADER) !== CSRF_HEADER_VALUE) return next(forbidden());

  const originHeader = req.get('origin');
  if (originHeader !== undefined) {
    // "null" (iframe sandbox, file://) y cualquier valor no parseable se rechazan.
    const origin = originOf(originHeader);
    if (!origin || !isAcceptableOrigin(origin, req)) return next(forbidden());
    return next();
  }

  const referer = req.get('referer');
  if (referer !== undefined) {
    const origin = originOf(referer);
    if (!origin || !isAcceptableOrigin(origin, req)) return next(forbidden());
  }

  return next();
};
