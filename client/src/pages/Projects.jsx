import { useState, useEffect } from 'react';
import { Photo } from '../design-system/Photo';
import { projectsAPI } from '../services/api';

const FILTERS = ['Todos', 'Obra nueva', 'Reformas', 'Comunidades', 'Spa'];

export default function Projects() {
  const [active, setActive] = useState('Todos');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll()
      .then(({ data }) => setProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => active === 'Todos' || p.category === active);

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Proyectos</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 40px)', letterSpacing: '-0.02em',
                       fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>Cada piscina, una historia</h1>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActive(f)} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              border: active === f ? '2px solid var(--brand-primary)' : '2px solid var(--border-subtle)',
              background: active === f ? 'var(--brand-primary)' : '#fff',
              color: active === f ? '#fff' : 'var(--text-body)',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="ps-masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: 16,
                                    height: i % 2 === 0 ? 260 : 200, borderRadius: 'var(--radius-lg)',
                                    background: 'var(--grey-200)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 17 }}>No hay proyectos en esta categoría todavía.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Cargalos desde el panel de administración.</p>
          </div>
        ) : (
          <div className="ps-masonry">
            {filtered.map((p, i) => (
              <div key={p._id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
                <Photo
                  label={`${p.title} · ${p.location}`}
                  height={i % 3 === 0 ? 260 : 200}
                  src={p.imageUrl || undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
