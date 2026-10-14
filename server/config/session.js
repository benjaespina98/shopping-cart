import { getRuntimeEnv } from './env.js';

// Cookie de sesión del panel de administración.
//
//   HttpOnly        el JavaScript de la página no puede leerla (un XSS no roba el token).
//   SameSite=Strict el navegador no la manda en requests iniciados desde otro sitio.
//   Path=/api       solo viaja a la API, no a cada página ni asset estático.
//   Secure          solo por HTTPS; se exige en producción y preview. En desarrollo local sin
//                   HTTPS se omite, porque el navegador descartaría la cookie.
export const SESSION_COOKIE = 'ps_admin_session';

export const sessionCookieOptions = (maxAgeSeconds) => ({
  httpOnly: true,
  secure: ['production', 'preview'].includes(getRuntimeEnv()),
  sameSite: 'strict',
  path: '/api',
  // Express espera milisegundos. Sin maxAge es una cookie de sesión del navegador (o, con
  // clearCookie, la que se usa para borrarla).
  ...(maxAgeSeconds ? { maxAge: maxAgeSeconds * 1000 } : {}),
});
