// Prefetch de la portada. Se carga desde index.html (ver el comentario allí).
// React lo consume en src/utils/prefetch.js; si falla, cada componente vuelve a pedir.
window.__prefetch = {
  projects: fetch('/api/projects').then((r) => r.json()).catch(() => null),
  settings: fetch('/api/settings/public').then((r) => r.json()).catch(() => null),
};
