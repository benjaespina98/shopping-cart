// Campo trampa anti-spam. Una persona nunca lo ve ni lo completa; los bots que rellenan
// todos los inputs de un formulario sí. El server descarta (sin guardar ni mandar mail) los
// envíos que lo traen con contenido (ver server/utils/antiSpam.js).
//
// Accesibilidad: todo el bloque va con aria-hidden (los lectores de pantalla lo ignoran), el
// input queda fuera del orden de tabulación (tabIndex -1) y sin autocompletado. Se oculta con
// la técnica "visually hidden" en vez de display:none (que algunos bots detectan) y sin
// moverlo fuera de pantalla con valores negativos, para no generar scroll horizontal.
export default function Honeypot({ value, onChange, name = 'website' }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <label>
        No completar este campo
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}
