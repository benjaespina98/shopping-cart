import { FiCheckCircle, FiPenTool, FiShield, FiHeart } from 'react-icons/fi';
import { Card } from '../design-system/Card';
import { Photo } from '../design-system/Photo';
import StatsStrip from '../components/sections/StatsStrip';
import CtaBlock from '../components/sections/CtaBlock';
import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../context/SettingsContext';

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
  const valuesReveal = useReveal();
  const { settings } = useSettings();

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
              borderRadius: 'var(--radius-xl)', padding: 3,
              background: 'var(--surface-on-dark)',
              border: '1px solid var(--border-on-dark-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <Photo
                label="Equipo"
                alt="Equipo de Playa & Sol Piscinas en Villa María"
                src={settings.aboutPhotoUrl || undefined}
                height={480}
                radius="var(--radius-lg)"
                priority
                sizes="(max-width: 767px) calc(100vw - 40px), 540px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsStrip />

      {/* STORY */}
      <section style={{ padding: 'var(--space-9) var(--space-5)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>Cómo trabajamos</div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                       color: 'var(--text-strong)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            Un mismo equipo, de la visita técnica al último detalle
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.75, textAlign: 'center' }}>
            En Playa & Sol no tercerizamos cuadrillas para cada obra. El mismo equipo que te visita y proyecta tu piscina es el que después la construye, la repara o la pone a punto cuando hace falta. Eso significa una sola persona de contacto, sin intermediarios y sin pases de responsabilidad cuando algo necesita ajustarse.
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
      <CtaBlock
        title="¿Hablamos de tu proyecto?"
        text="Conocé nuestros trabajos terminados o contanos qué tenés en mente."
        primaryLabel="Empezar mi proyecto"
        secondaryLabel="Ver proyectos"
        secondaryTo="/proyectos"
      />
    </div>
  );
}
