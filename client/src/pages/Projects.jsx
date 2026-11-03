import { useState, useEffect } from 'react';
import { Photo } from '../design-system/Photo';
import { Lightbox } from '../components/ui/Lightbox';
import { projectsAPI } from '../services/api';
import { takePrefetched } from '../utils/routePrefetch';
import { PROJECT_PHOTO } from '../utils/imageSpecs';
import PageHeader from '../components/sections/PageHeader';
import CtaBlock from '../components/sections/CtaBlock';
import { Button } from '../design-system/Button';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    takePrefetched('projects', () => projectsAPI.getAll())
      .then(({ data }) => setProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lightboxImages = projects
    .filter((p) => p.imageUrl)
    .map((p) => ({ src: p.imageUrl, label: `${p.title} · ${p.location}` }));

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <PageHeader
          eyebrow="Proyectos"
          title="Obras terminadas"
          lead="Piscinas que construimos y reformamos en Villa María y la región."
          style={{ marginBottom: 40 }}
        />

        {loading ? (
          <div className="ps-masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: 16,
                                    height: i % 2 === 0 ? 260 : 200, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--grey-200)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0 24px', color: 'var(--text-body)' }}>
            <p style={{ fontSize: 17, marginBottom: 'var(--space-4)' }}>Estamos actualizando la galería de obras.</p>
            <Button variant="outline" to="/contacto">Consultanos por nuestros trabajos</Button>
          </div>
        ) : (
          <div className="ps-masonry">
            {projects.map((p, i) => {
              const lightboxIdx = lightboxImages.findIndex((img) => img.src === p.imageUrl);
              const canOpen = p.imageUrl && lightboxIdx !== -1;
              // Con foto la tarjeta es un botón (teclado y lectores de pantalla); sin foto, un bloque estático.
              const Tag = canOpen ? 'button' : 'div';
              return (
                <Tag key={p._id}
                  {...(canOpen ? {
                    type: 'button',
                    onClick: () => setLightboxIndex(lightboxIdx),
                    'aria-label': `Ampliar la foto de ${p.title}, ${p.location}`,
                  } : {})}
                  style={{
                    display: 'block', width: '100%', padding: 0, border: 0, background: 'none', textAlign: 'left',
                    breakInside: 'avoid', marginBottom: 16, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    cursor: canOpen ? 'zoom-in' : 'default',
                  }}>
                  <Photo
                    label={`${p.title} · ${p.location}`}
                    height={i % 3 === 0 ? 280 : 220}
                    src={p.imageUrl || undefined}
                    zoom
                    priority={i < 3}
                    sizes={PROJECT_PHOTO.sizes}
                    srcSetWidths={PROJECT_PHOTO.widths}
                  />
                </Tag>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <div style={{ marginTop: 64 }}>
        <CtaBlock
          title="¿Querés una piscina como estas?"
          text="Contanos qué necesitás y armamos un presupuesto a tu medida."
        />
      </div>
    </section>
  );
}
