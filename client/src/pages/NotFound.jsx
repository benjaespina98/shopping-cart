import { Link } from 'react-router-dom';

// Ruta comodín. El status HTTP sigue siendo 200: es una SPA y el hosting responde con el
// index.html para cualquier ruta; lo que evita su indexación es el meta robots noindex que
// pone usePageMeta (ver seo/pageMeta.js).
export default function NotFound() {
  return (
    <section style={{ padding: '72px 20px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 5vw, 38px)',
          color: 'var(--text-strong)',
          marginBottom: 'var(--space-3)',
        }}
      >
        Página no encontrada
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
        La dirección que buscás no existe o cambió de lugar.
      </p>
      <Link
        to="/"
        style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'underline' }}
      >
        Volver al inicio
      </Link>
    </section>
  );
}
