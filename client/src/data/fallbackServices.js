// Servicios de respaldo: lo que se muestra mientras carga la API o si todavía no se
// cargó ninguno desde /admin/servicios.
//
// Son las líneas de trabajo de la empresa con los mismos textos que se cargaron en el panel, así la
// home no "cambia de contenido" cuando llega la respuesta de la API (antes el respaldo tenía otros
// servicios y otras descripciones, y se veía un salto en cada carga). Los accesorios y productos
// viven en la Tienda, no acá.
//
// `description` es la versión para las tarjetas del inicio y `descriptionLong` la de la página de
// servicios (si falta, esa página usa `description`). Los textos no prometen plazos, garantías ni
// precios: lo que no está confirmado por la empresa no va en el respaldo.
export const FALLBACK_SERVICES = [
  {
    title: 'Piscinas de hormigón', tag: 'Diseño y obra', tone: 'teal', variant: 'soft',
    description: 'Diseñamos y construimos piscinas de hormigón a medida, adaptadas a tu terreno, tu estilo de vida y el resultado que imaginás. Nos ocupamos de todo el proceso, desde el proyecto hasta la entrega final.',
    bullets: ['Proyecto y diseño personalizado', 'Construcción en hormigón', 'Revestimientos y terminaciones'],
    cta: 'Pedir presupuesto',
  },
  {
    title: 'Piscinas de fibra INDUPLAST', tag: 'Fibra', tone: 'teal', variant: 'soft',
    description: 'Trabajamos con piscinas de fibra INDUPLAST. Consultanos por los modelos y medidas disponibles y te ayudamos a elegir el que mejor se adapte a tu espacio.',
    bullets: [],
    cta: 'Consultar modelos',
  },
  {
    title: 'Revestimientos', tag: 'Renovación', tone: 'teal', variant: 'soft',
    description: 'Renová la estética y la protección de tu piscina con revestimientos de calidad. Trabajamos con materiales resistentes y acabados que combinan diseño, durabilidad y fácil mantenimiento.',
    bullets: ['Cerámicos', 'Travertino', 'Acabados resistentes y de larga vida útil'],
    cta: 'Quiero renovar mi piscina',
  },
  {
    title: 'Cercos perimetrales', tag: 'Seguridad', tone: 'teal', variant: 'soft',
    description: 'Instalamos cercos de seguridad que protegen a niños y mascotas sin afectar la estética de tu espacio exterior. Soluciones resistentes, discretas y adaptadas a cada proyecto.',
    bullets: ['Cercos removibles', 'Materiales resistentes a la intemperie', 'Instalación profesional'],
    cta: 'Consultar opciones',
  },
  {
    title: 'Cobertores', tag: 'Protección', tone: 'teal', variant: 'soft',
    description: 'Protegé tu piscina durante todo el año y reducí el mantenimiento diario. Contamos con cobertores pensados para mejorar la seguridad, conservar la temperatura y mantener el agua limpia por más tiempo.',
    bullets: ['Menor evaporación y pérdida de calor', 'Más seguridad y menos mantenimiento'],
    cta: 'Quiero asesoramiento',
  },
  {
    title: 'Climatización', tag: 'Confort', tone: 'teal', variant: 'soft',
    description: 'Soluciones de climatización para tu piscina. Contanos cómo la usás y te orientamos sobre la opción más adecuada.',
    bullets: [],
    cta: 'Consultar opciones',
  },
];

export const FALLBACK_SERVICE_NAMES = FALLBACK_SERVICES.map((s) => s.title);
