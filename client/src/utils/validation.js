// Compartido entre los formularios de Presupuesto y Contacto — estaban duplicados con
// pequeñas diferencias (Quote.jsx los tenía, Contact.jsx no tenía ninguno y dejaba pasar
// cualquier string no vacío como email o teléfono válido).
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[\d\s()+-]{6,}$/;

export const isValidEmail = (value) => EMAIL_RE.test(String(value).trim());
export const isValidPhone = (value) => PHONE_RE.test(String(value).trim());
