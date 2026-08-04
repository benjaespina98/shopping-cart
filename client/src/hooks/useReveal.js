import { useCallback, useRef, useState } from 'react';

// Aparición suave (fade + leve subida) la primera vez que la sección entra en pantalla.
// Uso: const { ref, className } = useReveal(); <section ref={ref} className={className}>
export function useReveal() {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef(null);
  const timerRef = useRef(null);

  // Ref de callback, no useRef + useEffect([]).
  //
  // Con un efecto de montaje, el observer se intentaba crear una única vez: cuando
  // montaba la PÁGINA. Las secciones que dependen de la API (por ejemplo "Productos
  // destacados", que sólo se renderiza si `featured.length > 0`) todavía no existían
  // en ese momento, así que `ref.current` era null, el efecto salía temprano y no se
  // creaba ningún observer. Como el efecto nunca se vuelve a ejecutar, esas secciones
  // quedaban en opacidad 0 de forma permanente: el contenido estaba en el DOM, ocupaba
  // su alto, y era invisible para siempre.
  //
  // Un ref de callback lo resuelve porque React lo invoca en el momento real en que el
  // nodo entra o sale del DOM, monte cuando monte.
  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!node) return;

    // Sin IntersectionObserver (navegadores viejos, entornos de prueba) el contenido
    // tiene que verse igual: esconderlo esperando un observer que no va a llegar
    // dejaría la página en blanco.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    // Si la sección monta tarde y para entonces ya quedó por encima del viewport,
    // nunca va a "entrar" scrolleando hacia abajo. Se muestra directo, sin animar.
    // Se exige alto real: un elemento sin medir todavía devuelve un rectángulo en
    // cero, y `bottom <= 0` a secas lo daba por "ya pasado" revelándolo de entrada.
    const rect = node.getBoundingClientRect();
    if (rect.height > 0 && rect.bottom <= 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
          observerRef.current = null;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      // Se dispara un poco antes de que el borde entre del todo, así la animación
      // ya terminó cuando la sección está realmente a la vista.
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(node);
    observerRef.current = observer;

    // Red de seguridad. La animación es un adorno; el contenido es el sitio. Si por
    // cualquier motivo el observer no llega a dispararse, a los 3 segundos se muestra
    // igual. Nunca puede pasar que una sección quede invisible de forma permanente.
    timerRef.current = setTimeout(() => setVisible(true), 3000);
  }, []);

  // No hace falta un useEffect de limpieza: React invoca este mismo callback con null
  // al desmontar, y ahí se desconecta. Tener además un cleanup de efecto era peor que
  // redundante — en el doble montaje que hace StrictMode en desarrollo, el cleanup del
  // primer montaje corría DESPUÉS de que el segundo ya había creado su observer, y lo
  // desconectaba. Resultado: ninguna sección aparecía nunca.

  return { ref, className: `ps-reveal${visible ? ' ps-reveal-visible' : ''}` };
}
