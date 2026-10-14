// Lista de orígenes permitidos (CORS y verificación de Origin/Referer del guard CSRF).
//
// Se calcula de forma perezosa y no al importar el módulo: los imports de ES modules se
// evalúan antes que loadServerEnv() de app.js, así que CLIENT_URL todavía no estaría cargado.

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

let cache = { source: null, exact: [], patterns: [] };

const load = () => {
  const source = process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173';
  if (cache.source === source) return cache;

  const all = source
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  cache = {
    source,
    exact: all.filter((origin) => !origin.includes('*')),
    patterns: all
      .filter((origin) => origin.includes('*'))
      .map((pattern) => {
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`, 'i');
      }),
  };
  return cache;
};

// Un request sin Origin (curl, server-to-server, navegación same-origin de un GET) se permite
// acá; quien necesite exigir Origin lo decide aparte (ver middleware/csrf.js).
export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  const { exact, patterns } = load();
  if (exact.includes(normalized)) return true;
  if (patterns.some((regex) => regex.test(normalized))) return true;

  // Cualquier puerto de localhost en desarrollo, para no depender del puerto de Vite.
  if (process.env.NODE_ENV !== 'production' && localDevOriginPattern.test(normalized)) return true;

  return false;
};

// El Origin del request es el mismo host que sirve la API: es una petición same-origin y por
// definición legítima (cubre los previews de Vercel, cuya URL cambia en cada deploy y no está en
// CLIENT_URL). Un sitio ajeno no puede hacer que su Origin coincida con el Host de la API.
export const isSameHostOrigin = (origin, req) => {
  try {
    const { host } = new URL(origin);
    return [req.get('host'), req.get('x-forwarded-host')].filter(Boolean).includes(host);
  } catch {
    return false;
  }
};
