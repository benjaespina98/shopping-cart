import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiDroplet, FiUsers, FiClock } from 'react-icons/fi';
import { productsAPI, projectsAPI, servicesAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';

const FALLBACK_SERVICES = [
  {
    title: 'Piscinas de obra', tag: 'Diseño y obra', tone: 'sun', variant: 'solid',
    description: 'Relevamos el terreno, proyectamos la forma y construimos en hormigón gunitado: la técnica que más años de vida le da a una pileta.',
    bullets: ['Proyecto 3D antes de iniciar la obra', 'Hormigón gunitado, sin uniones ni filtraciones', 'Garantía escrita de 10 años en el vaso'],
    cta: 'Quiero mi piscina',
  },
  {
    title: 'Reformas', tag: 'Puesta a punto', tone: 'teal', variant: 'soft',
    description: 'Una pileta envejecida pierde agua, color y seguridad. Recuperamos el vaso, la coronación y la depuración con materiales actuales.',
    bullets: ['Diagnóstico real antes de presupuestar', 'Cambio de revestimiento sin demoler el vaso', 'Filtros y bombas al día con la normativa'],
    cta: 'Solicitar presupuesto',
  },
  {
    title: 'Climatización', tag: 'Más temporada', tone: 'sun', variant: 'solid',
    description: 'Con la bomba de calor correcta y una cubierta bien elegida, el agua se mantiene a temperatura semanas antes y después de la temporada.',
    bullets: ['Bombas de calor de bajo consumo eléctrico', 'Cubiertas automáticas que cortan la evaporación', 'Hasta dos meses más de baño al año'],
    cta: 'Asesorarme',
  },
  {
    title: 'Cercos y seguridad', tag: 'Tranquilidad en casa', tone: 'teal', variant: 'soft',
    description: 'Instalamos barreras físicas certificadas, pensadas para frenar a los más chicos sin tapar la vista de la pileta.',
    bullets: ['Barreras removibles o fijas, según el espacio', 'Resistentes a impacto y a la intemperie', 'Instalación con cierre de seguridad certificado'],
    cta: 'Hablar con un especialista',
  },
];

const stats = [
  { Icon: FiAward,   n: '+30 años', l: 'de trayectoria en Villa María' },
  { Icon: FiDroplet, n: '+850',    l: 'piscinas construidas' },
  { Icon: FiUsers,   n: '100%',    l: 'atención personalizada' },
  { Icon: FiClock,   n: '48h',     l: 'para tu presupuesto' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [featured, setFeatured] = useState([]);
  const [heroProject, setHeroProject] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [services, setServices] = useState(FALLBACK_SERVICES);

  const statsReveal = useReveal();
  const servicesReveal = useReveal();
  const projectsReveal = useReveal();
  const productsReveal = useReveal();
  const ctaReveal = useReveal();

  const inCartByProductId = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [items]);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 4 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {});
    projectsAPI.getAll()
      .then(({ data }) => {
        const hero = data.find((p) => p.isHero) || data.find((p) => p.featured) || null;
        setHeroProject(hero);
        setFeaturedProjects(
          data.filter((p) => p.featured && p._id !== hero?._id).slice(0, 5)
        );
      })
      .catch(() => {});
    servicesAPI.getAll()
      .then(({ data }) => { if (data?.length > 0) setServices(data.slice(0, 4)); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <section className="ps-hero-section"
        style={{ background: 'var(--teal-700)', color: 'var(--text-inverse)',
                 padding: 'var(--space-9) var(--space-5) var(--space-10)', overflow: 'hidden' }}>
        <div className="ps-hero-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div>
            <div style={{ color: 'var(--sun-400)', fontFamily: 'var(--font-display)', fontWeight: 600,
                          letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, marginBottom: 'var(--space-4)' }}>
              Piscinas en Villa María, Córdoba
            </div>
            <h1 className="ps-hero-title"
              style={{ color: 'var(--text-inverse)', fontSize: 'clamp(32px, 8vw, 52px)', lineHeight: 1.08,
                       letterSpacing: '-0.02em', marginBottom: 'var(--space-5)',
                       fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Tu piscina,<br />disfrutada<br />todo el año
            </h1>
            <p className="ps-hero-subtitle"
              style={{ fontSize: 'clamp(14px, 4vw, 18px)', lineHeight: 1.65,
                       color: 'var(--text-inverse-muted)', maxWidth: 440, marginBottom: 'var(--space-6)' }}>
              Diseñamos, construimos y mantenemos piscinas a medida. Del primer plano al primer baño, sin complicaciones.
            </p>
            <div className="ps-hero-btns" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/presupuesto')}>Pide presupuesto</Button>
              <Button variant="outline" inverse size="lg" onClick={() => navigate('/proyectos')}>Ver proyectos</Button>
            </div>
          </div>
          <div className="ps-hero-photo">
            <div style={{
              borderRadius: 'var(--radius-xl)', padding: 3,
              background: 'var(--surface-on-dark)',
              border: '1px solid var(--border-on-dark-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <Photo
                label={heroProject ? `${heroProject.title} · ${heroProject.location}` : 'Piscina infinity · Villa María'}
                height={460}
                radius="var(--radius-lg)"
                src={heroProject?.imageUrl || undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — confianza y trayectoria, sin protagonismo del amarillo */}
      <section ref={statsReveal.ref} className={statsReveal.className}
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

      {/* SERVICES */}
      <section ref={servicesReveal.ref} className={servicesReveal.className} style={{ padding: 'var(--space-9) var(--space-5)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Qué hacemos</div>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 34px)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                         color: 'var(--text-strong)' }}>Todo lo que tu piscina necesita</h2>
          </div>
          <div className="ps-services-grid">
            {services.map(s => (
              <Card key={s._id || s.title} accent={s.tone} interactive padding="lg"
                style={{ display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate('/servicios')}>
                {s.tag && (
                  <Badge tone={s.tone} variant={s.variant || 'soft'} size="sm" style={{ marginBottom: 'var(--space-3)', alignSelf: 'flex-start' }}>
                    {s.tag}
                  </Badge>
                )}
                <h3 style={{ fontSize: 18, marginBottom: 'var(--space-2)', fontWeight: 600, fontFamily: 'var(--font-display)',
                             color: 'var(--text-strong)' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{s.description}</p>
                {s.bullets?.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    {s.bullets.slice(0, 3).map((b) => (
                      <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.4 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-primary)', marginTop: 7, flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ marginTop: 'var(--space-4)', color: 'var(--text-link)', fontWeight: 700, fontSize: 14 }}>
                  {s.cta || 'Saber más'} →
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS — el principal argumento de venta, con foto protagonista */}
      <section ref={projectsReveal.ref} className={projectsReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Proyectos recientes</div>
              <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 30px)', fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>
                Obra terminada, baño asegurado
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/proyectos')}>Ver galería</Button>
          </div>

          {featuredProjects.length === 0 ? (
            <div className="ps-projects-grid">
              <div style={{ gridRow: '1 / span 2' }}><Photo label="Cargá proyectos desde el admin" height="100%" /></div>
              <Photo label="Panel › Sitio web" height="100%" />
              <Photo label="Panel › Sitio web" height="100%" />
              <Photo label="Panel › Sitio web" height="100%" />
              <Photo label="Panel › Sitio web" height="100%" />
            </div>
          ) : (
            <div className="ps-projects-grid">
              {featuredProjects.map((p, i) => (
                <div key={p._id} style={{
                  position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  cursor: 'pointer', ...(i === 0 ? { gridRow: '1 / span 2' } : {}),
                }} onClick={() => navigate('/proyectos')}>
                  <Photo label={`${p.title} · ${p.location}`} height="100%" src={p.imageUrl || undefined} zoom />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section ref={productsReveal.ref} className={productsReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                          marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Top picks</div>
                <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 30px)', fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>
                  Productos destacados
                </h2>
              </div>
              <Button variant="outline" onClick={() => navigate('/tienda')}>Ver todos</Button>
            </div>
            <div className="ps-products-grid">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} inCartQuantity={inCartByProductId.get(p._id) || 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section ref={ctaReveal.ref} className={ctaReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="ps-cta-block"
            style={{ background: 'var(--teal-800)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8) var(--space-8)' }}>
            <div>
              <h2 style={{ color: 'var(--text-inverse)', fontSize: 32, marginBottom: 'var(--space-2)',
                           fontFamily: 'var(--font-display)', fontWeight: 600 }}>¿Listo para tu piscina?</h2>
              <p style={{ color: 'var(--text-inverse-muted)', fontSize: 16, maxWidth: 460 }}>
                Cuéntanos tu idea y te visitamos en 48 horas con un presupuesto sin compromiso.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate('/presupuesto')}>Empezar ahora</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
