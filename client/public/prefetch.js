// Prefetch de la portada. Se carga desde index.html (ver el comentario allí).
// React lo consume en src/utils/prefetch.js; si falla, cada componente vuelve a pedir.
window.__prefetch = {
  projects: fetch('/api/projects').then((r) => r.json()).catch(() => null),
  settings: fetch('/api/settings/public').then((r) => r.json()).catch(() => null),
};

// Precarga de la foto del hero. Sin esto la descarga recién arrancaba cuando React terminaba de
// montar la página: HTML -> /api/projects -> chunk de Landing -> render -> recién ahí el pedido de la
// imagen. Con el <link rel="preload"> la foto empieza a bajar apenas responde la API, en paralelo
// con el resto del arranque.
//
// Tiene que pedir EXACTAMENTE lo que va a pintar <Photo> en Landing.jsx (mismo srcset y sizes, con la
// receta de src/utils/cloudinary.js); si difiere, el navegador descarga dos veces. HERO_SIZES y
// HERO_WIDTHS se repiten acá porque este archivo es un script clásico que no pasa por el bundle:
// src/utils/heroPreload.test.js falla si se desincronizan. Solo URLs de res.cloudinary.com.
(function preloadHero() {
  var HERO_SIZES = '(max-width: 767px) calc(100vw - 40px), 540px';
  var HERO_WIDTHS = [400, 560, 800, 1080];
  var HERO_SRC_WIDTH = 1200;
  var UPLOAD = '/image/upload/';

  function cld(url, width) {
    var i = url.indexOf(UPLOAD) + UPLOAD.length;
    return url.slice(0, i) + 'f_auto,q_auto,c_limit,w_' + width + '/' + url.slice(i);
  }

  // Solo la home muestra el hero: en /tienda, /proyectos, /admin... la foto se bajaría con prioridad alta
  // sin usarse y le quitaría ancho de banda a la página real. (El fetch de arriba sí queda para todas.)
  if (location.pathname !== '/') return;

  window.__prefetch.projects.then(function (data) {
    if (!Array.isArray(data)) return;
    var hero = data.find(function (p) { return p.isHero; }) || data.find(function (p) { return p.featured; });
    var url = hero && hero.imageUrl;
    if (typeof url !== 'string' || url.indexOf('https://res.cloudinary.com/') !== 0 || url.indexOf(UPLOAD) === -1) return;
    // La URL va dentro de imagesrcset: una coma o un espacio agregaría candidatos de srcset.
    if (/[\s,"'<>]/.test(url)) return;

    var link = document.createElement('link');
    link.rel = 'preload';
    link.setAttribute('as', 'image');
    link.href = cld(url, HERO_SRC_WIDTH);
    link.setAttribute('imagesrcset', HERO_WIDTHS.map(function (w) { return cld(url, w) + ' ' + w + 'w'; }).join(', '));
    link.setAttribute('imagesizes', HERO_SIZES);
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  });
})();
