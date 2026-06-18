import { useNavigate } from 'react-router-dom';
import { Button } from '../design-system/Button';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';

const rows = [
  {
    t: 'Piscinas de obra', tag: 'Construcción', tone: 'sun', variant: 'solid',
    d: 'Proyecto a medida en hormigón gunitado: del estudio del terreno al revestimiento final. Formas libres, infinity, desbordante o skimmer.',
    pts: ['Estudio y diseño 3D', 'Hormigón gunitado', 'Revestimiento gresite o microcemento'],
  },
  {
    t: 'Reformas', tag: 'Renovación', tone: 'teal', variant: 'soft',
    d: 'Devolvemos la vida a tu piscina: cambio de vaso, coronación, iluminación LED y modernización de la depuración.',
    pts: ['Nuevo revestimiento', 'Iluminación LED', 'Depuración eficiente'],
  },
  {
    t: 'Climatización', tag: 'Confort', tone: 'sun', variant: 'solid',
    d: 'Bombas de calor, cubiertas y cobertores para disfrutar de tu piscina muchos más meses al año, con bajo consumo.',
    pts: ['Bomba de calor inverter', 'Cubierta automática', 'Manta térmica'],
  },
  {
    t: 'Cercos y seguridad', tag: 'Seguridad', tone: 'teal', variant: 'soft',
    d: 'Protegemos lo que más querés: cercos removibles y fijos alrededor de tu piscina para mayor tranquilidad con niños y mascotas.',
    pts: ['Cercos removibles y fijos', 'Materiales de alta resistencia', 'Instalación profesional'],
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Servicios</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 40px)', letterSpacing: '-0.02em',
                       fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>De la primera idea al último baño</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
          {rows.map((r, i) => (
            <div key={r.t} className="ps-service-row" style={{ direction: i % 2 ? 'rtl' : 'ltr' }}>
              <div className="ps-service-photo" style={{ direction: 'ltr' }}>
                <Photo label={r.t} height={280} />
              </div>
              <div style={{ direction: 'ltr' }}>
                <Badge tone={r.tone} variant={r.variant} style={{ marginBottom: 14 }}>{r.tag}</Badge>
                <h2 style={{ fontSize: 'clamp(20px, 5.5vw, 28px)', marginBottom: 12,
                             fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>{r.t}</h2>
                <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 18 }}>{r.d}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px',
                             display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {r.pts.map(p => (
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
                <Button variant="primary" onClick={() => navigate('/presupuesto')}>Pedir presupuesto</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
