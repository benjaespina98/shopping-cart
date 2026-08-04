// Servicios de respaldo: lo que se muestra mientras carga la API o si todavía no se
// cargó ninguno desde /admin/servicios.
//
// Estaban duplicados en Landing.jsx y Services.jsx con textos que ya habían empezado a
// divergir entre sí (mismo servicio, distinta descripción según la página). Acá viven
// una sola vez: `description` es la versión corta para las tarjetas del inicio y
// `descriptionLong` la extendida para la página de servicios.
export const FALLBACK_SERVICES = [
  {
    title: 'Piscinas de obra', tag: 'Diseño y obra', tone: 'sun', variant: 'solid',
    description: 'Relevamos el terreno, proyectamos la forma y construimos en hormigón gunitado: la técnica que más años de vida le da a una pileta.',
    descriptionLong: 'Relevamos el terreno, proyectamos la forma y construimos en hormigón gunitado: la técnica que más años de vida le da a una pileta. Cada decisión, pensada para que dure generaciones.',
    bullets: ['Proyecto 3D antes de iniciar la obra', 'Hormigón gunitado, sin uniones ni filtraciones', 'Garantía escrita de 10 años en el vaso'],
    cta: 'Quiero mi piscina',
  },
  {
    title: 'Reformas', tag: 'Puesta a punto', tone: 'teal', variant: 'soft',
    description: 'Una pileta envejecida pierde agua, color y seguridad. Recuperamos el vaso, la coronación y la depuración con materiales actuales.',
    descriptionLong: 'Una pileta envejecida pierde agua, color y seguridad. Recuperamos el vaso, la coronación y la depuración con materiales actuales, sin romper más de lo necesario.',
    bullets: ['Diagnóstico real antes de presupuestar', 'Cambio de revestimiento sin demoler el vaso', 'Filtros y bombas al día con la normativa'],
    cta: 'Solicitar presupuesto',
  },
  {
    title: 'Climatización', tag: 'Más temporada', tone: 'sun', variant: 'solid',
    description: 'Con la bomba de calor correcta y una cubierta bien elegida, el agua se mantiene a temperatura semanas antes y después de la temporada.',
    descriptionLong: 'Octubre a abril ya no alcanza. Con la bomba de calor correcta y una cubierta bien elegida, el agua se mantiene a temperatura semanas antes y después de la temporada.',
    bullets: ['Bombas de calor de bajo consumo eléctrico', 'Cubiertas automáticas que cortan la evaporación', 'Hasta dos meses más de baño al año'],
    cta: 'Asesorarme',
  },
  {
    title: 'Cercos y seguridad', tag: 'Tranquilidad en casa', tone: 'teal', variant: 'soft',
    description: 'Instalamos barreras físicas certificadas, pensadas para frenar a los más chicos sin tapar la vista de la pileta.',
    descriptionLong: 'Un descuido de segundos puede ser grave. Instalamos barreras físicas certificadas, pensadas para frenar a los más chicos sin tapar la vista de la pileta.',
    bullets: ['Barreras removibles o fijas, según el espacio', 'Resistentes a impacto y a la intemperie', 'Instalación con cierre de seguridad certificado'],
    cta: 'Hablar con un especialista',
  },
];

export const FALLBACK_SERVICE_NAMES = FALLBACK_SERVICES.map((s) => s.title);
