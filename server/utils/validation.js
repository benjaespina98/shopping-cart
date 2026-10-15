// Validaciones compartidas por el seed, los controllers y los modelos.
// Sin dependencias: funciones puras, fáciles de testear.

// Largo mínimo de contraseña de admin. Lo usan el modelo User, createUser /
// changeOwnPassword y el seed, para que no se desalineen.
export const MIN_PASSWORD_LENGTH = 12;

// Formato de email estricto (RFC 5322 simplificado): una sola @, parte local sin
// espacios ni caracteres de control, dominio con al menos un punto y etiquetas válidas.
// Rechaza "a@b", "a b@c.com", "a@@b.com", "<a>@b.com" y cualquier CR/LF.
const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const isValidEmail = (value) =>
  typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);

// CR, LF, otros caracteres de control y separadores de línea Unicode. Cualquier campo
// que llegue a un header de mail (subject, replyTo) no puede traerlos: es la vía de la
// inyección de headers.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F\u2028\u2029]/;

export const hasControlChars = (value) => CONTROL_CHARS_RE.test(String(value ?? ''));
