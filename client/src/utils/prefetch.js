// index.html dispara fetch('/api/projects') y fetch('/api/settings/public') en un
// <script> inline, apenas el navegador tiene el HTML — sin esperar a que el bundle de
// React baje, se parsee y monte. Esos milisegundos son justo los que la foto del hero
// pasaba como placeholder: el componente recién pedía los datos en su propio useEffect,
// después de todo ese trabajo.
//
// `consumePrefetch(key)` entrega esa promesa una única vez y la descarta: una vuelta
// posterior a "/" dentro de la misma sesión de SPA (sin recargar la página) tiene que
// pedir datos frescos como cualquier otra navegación, no reusar el snapshot inicial.
export function consumePrefetch(key) {
  const store = typeof window !== 'undefined' ? window.__prefetch : null;
  const promise = store?.[key];
  if (!promise) return null;
  delete store[key];
  return promise;
}
