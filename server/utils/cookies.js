// Lectura de cookies del header Cookie, sin dependencias.
//
// Para ESCRIBIR cookies se usa res.cookie()/res.clearCookie() de Express (ya incluido). Solo
// falta parsear lo que manda el navegador, que son pocas líneas: no se justifica sumar
// cookie-parser (una dependencia más en el camino de autenticación) para esto.

export const parseCookies = (header) => {
  const cookies = {};
  if (typeof header !== 'string' || header.length === 0 || header.length > 8192) return cookies;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 1) continue;

    const name = part.slice(0, index).trim();
    let value = part.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);

    // La primera aparición gana: evita que una cookie duplicada pise a la legítima.
    if (name && !(name in cookies)) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  }
  return cookies;
};
