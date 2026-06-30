import { useNavigate } from 'react-router-dom';
import { FiAward, FiDroplet, FiUsers, FiClock, FiCheckCircle, FiPenTool, FiShield, FiHeart } from 'react-icons/fi';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Photo } from '../design-system/Photo';
import { useReveal } from '../hooks/useReveal';

const stats = [
  { Icon: FiAward,   n: '+30 años', l: 'de trayectoria en Villa María' },
  { Icon: FiDroplet, n: '+850',     l: 'piscinas construidas' },
  { Icon: FiUsers,   n: '100%',     l: 'atención personalizada' },
  { Icon: FiClock,   n: '48h',      l: 'para tu presupuesto' },
];

const values = [
  {
    Icon: FiPenTool,
    title: 'Cada obra, a medida',
    text: 'No vendemos un modelo único. Estudiamos el terreno y el uso real que le vas a dar antes de proyectar nada.',
  },
  {
    Icon: FiShield,
    title: 'Materiales que se eligen, no se improvisan',
    text: 'Hormigón gunitado, equipos de marcas reconocidas y mano de obra propia: nada tercerizado a último momento.',
  },
  {
    Icon: FiCheckCircle,
    title: 'Garantía por escrito',
    text: 'Lo que prometemos queda asentado. Si algo falla por nuestra parte, lo resolvemos sin vueltas.',
  },
  {
    Icon: FiHeart,
    title: 'Te acompañamos después de la obra',
    text: 'El servicio no termina cuando te entregamos la pileta. Seguimos disponibles para mantenimiento y consultas.',
  },
];

export default function About() {
  const navigate = useNavigate();
  const reveal = useReveal();
  const valuesReveal = useReveal();
  const ctaReveal = useReveal();

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <section style={{ background: 'var(--teal-700)', color: 'var(--text-inverse)',
                         padding: 'var(--space-9) var(--space-5) var(--space-8)', overflow: 'hidden' }}>
        <div className="ps-hero-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div>
            <div style={{ color: 'var(--sun-400)', fontFamily: 'var(--font-display)', fontWeight: 600,
                          letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, marginBottom: 'var(--space-4)' }}>
              Nosotros
            </div>
            <h1 style={{ color: 'var(--text-inverse)', fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1.12,
                         letterSpacing: '-0.02em', marginBottom: 'var(--space-5)',
                         fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Construimos piscinas en Villa María desde hace más de 30 años
            </h1>
            <p style={{ fontSize: 'clamp(14px, 4vw, 18px)', lineHeight: 1.65,
                         color: 'var(--text-inverse-muted)', maxWidth: 460 }}>
              Empezamos como una empresa familiar de la región y seguimos siéndolo: cada proyecto lo seguimos nosotros mismos, de punta a punta, con el mismo equipo de siempre.
            </p>
          </div>
          <div className="ps-hero-photo">
            <div style={{
              borderRadius: 'var(--radius-xl)', padding: 6,
              background: 'var(--surface-on-dark)',
              border: '1px solid var(--border-on-dark-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <Photo label="Nuestro equipo en obra" height={360} radius="var(--radius-lg)" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={reveal.ref} className={reveal.className}
        style={{ background: 'var(--surface-card)', padding: 'var(--space-8) var(--space-5)',
                 borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="ps-stats-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          {stats.map((s) => (
            <div key={s.l} className="ps-stat-item" style={{ textAlign: 'center', padding: '0 var(--space-5)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto var(--space-3)',
                border: '2px solid var(--brand-accent)', color: 'var(--brand-accent-press)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.Icon size={19} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
                            color: 'var(--text-strong)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section style={{ padding: 'var(--space-9) var(--space-5)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>Cómo trabajamos</div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                       color: 'var(--text-strong)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            Un mismo equipo, de la visita técnica al último detalle
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.75, textAlign: 'center' }}>
            En Playa &amp; Sol no tercerizamos cuadrillas para cada obra. El mismo equipo que te visita y proyecta tu piscina es el que después la construye, la repara o la pone a punto cuando hace falta. Eso significa una sola persona de contacto, sin intermediarios y sin pases de responsabilidad cuando algo necesita ajustarse.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section ref={valuesReveal.ref} className={valuesReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)', background: 'var(--surface-sunken)', paddingTop: 'var(--space-9)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Por qué elegirnos</div>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 34px)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                         color: 'var(--text-strong)' }}>Lo que no cambia, obra tras obra</h2>
          </div>
          <div className="ps-services-grid">
            {values.map((v) => (
              <Card key={v.title} padding="lg">
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)',
                  background: 'var(--teal-50)', color: 'var(--brand-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <v.Icon size={19} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 'var(--space-2)', fontWeight: 600, fontFamily: 'var(--font-display)',
                             color: 'var(--text-strong)' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{v.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaReveal.ref} className={ctaReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="ps-cta-block"
            style={{ background: 'var(--teal-800)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8) var(--space-8)' }}>
            <div>
              <h2 style={{ color: 'var(--text-inverse)', fontSize: 32, marginBottom: 'var(--space-2)',
                           fontFamily: 'var(--font-display)', fontWeight: 600 }}>¿Hablamos de tu proyecto?</h2>
              <p style={{ color: 'var(--text-inverse-muted)', fontSize: 16, maxWidth: 460 }}>
                Conocé nuestros trabajos terminados o contanos qué tenés en mente.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button variant="outline" inverse size="lg" onClick={() => navigate('/proyectos')}>Ver proyectos</Button>
              <Button variant="primary" size="lg" onClick={() => navigate('/presupuesto')}>Empezar mi proyecto</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
