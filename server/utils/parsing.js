// Helpers para leer campos de FormData (multer los entrega siempre como string) que en
// realidad son un array o un booleano. Estaban reimplementados con pequeñas variaciones en
// productController, projectController y serviceController.

// Los checkboxes/toggles del admin viajan como el string 'true'/'false' en FormData, pero
// algún caller interno puede pasar ya un boolean real — se aceptan los dos.
export function toBoolean(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value === true || value === 'true';
}

// Campos tipo "tags"/"bullets": el admin los manda como JSON.stringify(array), pero se
// acepta también una lista separada por comas por si el string no es JSON válido.
export function parseJsonArray(value, fallback = []) {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return fallback;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // no era JSON — se intenta como lista separada por comas
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
