// Escapa los caracteres especiales de una regex para poder usar texto arbitrario
// (por ejemplo, entrada del usuario en un filtro de búsqueda) dentro de un `new RegExp(...)`
// sin que se interprete como patrón. Sin esto, un input como "(a+)+$" puede provocar
// backtracking catastrófico (ReDoS) o simplemente romper la query.
export function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
