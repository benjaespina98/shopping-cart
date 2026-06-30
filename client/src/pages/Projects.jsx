import { useState, useEffect } from 'react';
import { Photo } from '../design-system/Photo';
import { Lightbox } from '../components/ui/Lightbox';
import { projectsAPI } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    projectsAPI.getAll()
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Proyectos</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 40px)', letterSpacing: '-0.02em',
                       fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>Cada piscina, una historia</h1>
        </div>

        {loading ? (
          <div className="ps-masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: 16,
                                    height: i % 2 === 0 ? 260 : 200, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--grey-200)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 17 }}>Todavía no hay proyectos cargados.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Cargalos desde el panel de administración.</p>
          </div>
        ) : (
          <div className="ps-masonry">
            {projects.map((p, i) => {
              const lightboxIdx = lightboxImages.findIndex((img) => img.src === p.imageUrl);
              return (
                <div key={p._id}
                  onClick={() => p.imageUrl && lightboxIdx !== -1 && setLightboxIndex(lightboxIdx)}
                  style={{
                    breakInside: 'avoid', marginBottom: 16, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    cursor: p.imageUrl ? 'pointer' : 'default',
                  }}>
                  <Photo
                    label={`${p.title} · ${p.location}`}
                    height={i % 3 === 0 ? 280 : 220}
                    src={p.imageUrl || undefined}
                    zoom
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </section>
  );
}
