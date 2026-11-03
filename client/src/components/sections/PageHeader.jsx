// Encabezado de las páginas internas (Servicios, Proyectos, Contacto, Presupuesto, Tienda).
// Cada página repetía su propio eyebrow + h1 con tamaños distintos (`clamp(20px, 5vw, 40px)`,
// `clamp(22px, 5.5vw, 38px)`, `clamp(26px, 5vw, 42px)`): el mismo nivel de título cambiaba de
// tamaño según la página. Acá queda una sola escala.
export const H1_SIZE = 'clamp(28px, 5.5vw, 42px)';
export const H2_SIZE = 'clamp(22px, 4.5vw, 32px)';

export default function PageHeader({ eyebrow, title, lead, align = 'center', maxWidth = 680, style }) {
  const centered = align === 'center';

  return (
    <header style={{
      textAlign: align, maxWidth: centered ? maxWidth : undefined,
      margin: centered ? '0 auto var(--space-8)' : '0 0 var(--space-7)', ...style,
    }}>
      {eyebrow && <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>{eyebrow}</div>}
      <h1 style={{
        fontSize: H1_SIZE, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)',
        fontWeight: 700, color: 'var(--text-strong)', overflowWrap: 'break-word',
        marginBottom: lead ? 'var(--space-4)' : 0,
      }}>
        {title}
      </h1>
      {lead && (
        <p style={{ fontSize: 17, color: 'var(--text-body)', lineHeight: 1.65, maxWidth: centered ? undefined : maxWidth }}>
          {lead}
        </p>
      )}
    </header>
  );
}

// Título de sección dentro de una página (eyebrow + h2). Mismo criterio: una sola escala.
export function SectionHeading({ eyebrow, title, align = 'center', action, style }) {
  const heading = (
    <div style={{ textAlign: align }}>
      {eyebrow && <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{eyebrow}</div>}
      <h2 style={{ fontSize: H2_SIZE, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                   fontWeight: 700, color: 'var(--text-strong)' }}>{title}</h2>
    </div>
  );

  if (!action) return <div style={{ marginBottom: 'var(--space-7)', ...style }}>{heading}</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap',
                  gap: 'var(--space-3)', marginBottom: 'var(--space-6)', ...style }}>
      {heading}
      {action}
    </div>
  );
}
