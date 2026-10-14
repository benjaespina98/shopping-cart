// Honeypot de los formularios públicos (presupuesto, contacto, pedido).
//
// El cliente renderiza un campo oculto (`website`) que una persona nunca ve ni completa; los
// bots que rellenan todos los inputs lo llenan. Si llega con contenido, el server responde
// con la MISMA forma y status que un éxito real (para que el bot no note la diferencia y no
// reintente variando datos), pero no guarda nada ni manda mail.

export const HONEYPOT_FIELD = 'website';

export const isHoneypotTripped = (body) => {
  const value = body?.[HONEYPOT_FIELD];
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== '';
};

// Solo un contador por formulario, en memoria del proceso: sin IP, sin datos personales y
// sin el contenido enviado. Sirve para ver en los logs si el honeypot está atrapando algo.
const hits = new Map();

export const recordHoneypotHit = (form) => {
  const total = (hits.get(form) || 0) + 1;
  hits.set(form, total);
  console.warn(`[anti-spam] honeypot activado en ${form} (acumulado de este proceso: ${total})`);
  return total;
};

export const getHoneypotHits = (form) => hits.get(form) || 0;

export const resetHoneypotHits = () => hits.clear();
