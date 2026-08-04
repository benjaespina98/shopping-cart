// Categorías de respaldo, sólo para cuando /api/categories no responde.
// Estaban duplicadas en Shop.jsx y AdminProducts.jsx; si el negocio agrega una
// categoría real había que acordarse de tocar ambas listas.
export const FALLBACK_CATEGORIES = [
  'Química del agua',
  'Limpieza',
  'Cercos y seguridad',
  'Climatización',
  'Accesorios',
];
