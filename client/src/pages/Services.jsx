import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../design-system/Button';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';
import { servicesAPI } from '../services/api';

const FALLBACK_ROWS = [
  {
    title: 'Piscinas de obra', tag: 'Construcción', tone: 'sun', variant: 'solid',
    description: 'Proyecto a medida en hormigón gunitado: del estudio del terreno al revestimiento final. Formas libres, infinity, desbordante o skimmer.',
    bullets: ['Estudio y diseño 3D', 'Hormigón gunitado', 'Revestimiento gresite o microcemento'],
  },
  {
    title: 'Reformas', tag: 'Renovación', tone: 'teal', variant: 'soft',
    description: 'Devolvemos la vida a tu piscina: cambio de vaso, coronación, iluminación LED y modernización de la depuración.',
    bullets: ['Nuevo revestimiento', 'Iluminación LED', 'Depuración eficiente'],
  },
  {
    title: 'Climatización', tag: 'Confort', tone: 'sun', variant: 'solid',
    description: 'Bombas de calor, cubiertas y cobertores para disfrutar de tu piscina muchos más meses al año, con bajo consumo.',
    bullets: ['Bomba de calor inverter', 'Cubierta automática', 'Manta térmica'],
  },
  {
    title: 'Cercos y seguridad', tag: 'Seguridad', tone: 'teal', variant: 'soft',
    description: 'Protegemos lo que más querés: cercos removibles y fijos alrededor de tu piscina para mayor tranquilidad con niños y mascotas.',
    bullets: ['Cercos removibles y fijos', 'Materiales de alta resistencia', 'Instalación profesional'],
  },
];

export default function Services() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(FALLBACK_ROWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesAPI.getAll()
      .then(({ data }) => { if (data?.length > 0) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Servicios</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 40px)', letterSpacing: '-0.02em',
                       fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>De la primera idea al último baño</h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="ps-service-row">
                <div style={{ height: 280, borderRadius: 'var(--radius-lg)', background: 'var(--grey-200)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 18, width: '40%', borderRadius: 6, background: 'var(--grey-200)' }} />
                  <div style={{ height: 28, width: '60%', borderRadius: 6, background: 'var(--grey-200)' }} />
                  <div style={{ height: 60, width: '100%', borderRadius: 6, background: 'var(--grey-200)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
            {rows.map((r, i) => (
              <div key={r._id || r.title} className="ps-service-row" style={{ direction: i % 2 ? 'rtl' : 'ltr' }}>
                <div className="ps-service-photo" style={{ direction: 'ltr' }}>
                  <Photo label={r.title} height={280} src={r.imageUrl || undefined} />
                </div>
                <div style={{ direction: 'ltr' }}>
                  <Badge tone={r.tone} variant={r.variant} style={{ marginBottom: 14 }}>{r.tag}</Badge>
                  <h2 style={{ fontSize: 'clamp(20px, 5.5vw, 28px)', marginBottom: 12,
                               fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>{r.title}</h2>
                  <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 18 }}>{r.description}</p>
                  {r.bullets?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px',
                                 display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {r.bullets.map(p => (
                        <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10,
                                            fontSize: 15, color: 'var(--text-body)' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal-50)',
                                         color: 'var(--teal-700)', display: 'inline-flex',
                                         alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button variant="primary" onClick={() => navigate('/presupuesto')}>Pedir presupuesto</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
