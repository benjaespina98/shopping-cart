import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/Button';
import { useReveal } from '../../hooks/useReveal';

// Bloque de cierre "¿Hablamos?" que aparece al final de las páginas del sitio.
// Cada página tenía su propia copia del mismo markup con distinto texto; ahora el
// texto es prop y el diseño uno solo.
export default function CtaBlock({
  title = '¿Listo para tu piscina?',
  text = 'Contanos tu idea y nos contactamos en 48 horas con un presupuesto sin compromiso.',
  primaryLabel = 'Empezar ahora',
  primaryTo = '/presupuesto',
  secondaryLabel,
  secondaryTo,
}) {
  const navigate = useNavigate();
  const reveal = useReveal();

  return (
    <section ref={reveal.ref} className={reveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div className="ps-cta-block"
          style={{ background: 'var(--teal-800)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8) var(--space-8)' }}>
          <div>
            <h2 style={{ color: 'var(--text-inverse)', fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: 'var(--space-2)',
                         fontFamily: 'var(--font-display)', fontWeight: 600 }}>{title}</h2>
            <p style={{ color: 'var(--text-inverse-muted)', fontSize: 16, maxWidth: 460 }}>{text}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {secondaryLabel && (
              <Button variant="outline" inverse size="lg" onClick={() => navigate(secondaryTo)}>{secondaryLabel}</Button>
            )}
            <Button variant="primary" size="lg" onClick={() => navigate(primaryTo)}>{primaryLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
