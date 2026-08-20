import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { productsAPI, projectsAPI, servicesAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import StatsStrip from '../components/sections/StatsStrip';
import CtaBlock from '../components/sections/CtaBlock';
import { FALLBACK_SERVICES } from '../data/fallbackServices';
import { useCart } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';
import { consumePrefetch } from '../utils/prefetch';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';
import { HERO_BLUR_PLACEHOLDER } from '../data/heroFallback';

export default function Landing() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [featured, setFeatured] = useState([]);
  const [heroProject, setHeroProject] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [services, setServices] = useState(FALLBACK_SERVICES);

  const servicesReveal = useReveal();
  const projectsReveal = useReveal();
  const productsReveal = useReveal();

  const inCartByProductId = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [items]);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 4 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {});

    // Usa el fetch disparado desde index.html si llegó a tiempo (ver
    // src/utils/prefetch.js); si no hay prefetch o vino vacío, pide como siempre.
    const prefetched = consumePrefetch('projects');
    (prefetched ? prefetched : Promise.resolve(null))
      .then((data) => (Array.isArray(data) ? data : projectsAPI.getAll().then((res) => res.data)))
      .then((data) => {
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
              <Button variant="primary" size="lg" onClick={() => navigate('/presupuesto')}>Solicitar presupuesto</Button>
              <Button variant="outline" inverse size="lg" onClick={() => navigate('/proyectos')}>Ver proyectos</Button>
            </div>
          </div>
          <div className="ps-hero-photo ps-hero-photo--show">
            <div style={{
              borderRadius: 'var(--radius-xl)', padding: 3,
              background: 'var(--surface-on-dark)',
              border: '1px solid var(--border-on-dark-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <Photo
                label={heroProject ? `${heroProject.title} · ${heroProject.location}` : 'Piscina infinity · Villa María'}
                alt={heroProject
                  ? `Piscina ${heroProject.title} construida por Playa & Sol en ${heroProject.location}`
                  : 'Piscina de obra a medida construida por Playa & Sol en Villa María, Córdoba'}
                height={460}
                radius="var(--radius-lg)"
                src={heroProject?.imageUrl || undefined}
                // Mientras todavía no llegó la respuesta de /api/projects, muestra una
                // miniatura borrosa de la foto del hero en vez de la caja lisa color
                // marca — así nunca se ve "vacío" antes de que aparezca la foto nítida.
                placeholderDataUrl={!heroProject ? HERO_BLUR_PLACEHOLDER : undefined}
                priority
                sizes="(max-width: 767px) calc(100vw - 40px), 540px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — confianza y trayectoria, sin protagonismo del amarillo */}
      <StatsStrip />

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
      <CtaBlock />
    </div>
  );
}
