import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { productsAPI, projectsAPI, servicesAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import StatsStrip from '../components/sections/StatsStrip';
import CtaBlock from '../components/sections/CtaBlock';
import { SectionHeading } from '../components/sections/PageHeader';
import { FALLBACK_SERVICES } from '../data/fallbackServices';
import { useCart } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';
import { consumePrefetch } from '../utils/prefetch';
import { WHATSAPP_GREETING } from '../utils/whatsapp';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';
import { HERO_BLUR_PLACEHOLDER } from '../data/heroFallback';

// Columnas de la grilla de líneas de trabajo según la cantidad de tarjetas, para no dejar una huérfana
// suelta en la última fila (4 → 4 en fila; 5 y 6 → 3; 7 y 8 → 4).
const serviceColumns = (count) => {
  if (count <= 4) return Math.max(count, 1);
  return count % 4 === 0 || count % 4 === 3 ? 4 : 3;
};

export default function Landing() {
  const { items } = useCart();
  const [featured, setFeatured] = useState([]);
  const [heroProject, setHeroProject] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  // `featuredProjects.length === 0` por sí solo no distingue "todavía no respondió
  // /api/projects" de "ya respondió y no hay ninguno destacado": mientras la respuesta está en
  // camino se muestra el esqueleto, y si no hay proyectos destacados la sección no se muestra.
  const [projectsLoading, setProjectsLoading] = useState(true);
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
      .catch(() => {})
      .finally(() => setProjectsLoading(false));

    servicesAPI.getAll()
      .then(({ data }) => { if (data?.length > 0) setServices(data.slice(0, 8)); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* HERO — qué hacemos, dónde y hace cuánto, y las dos formas de consultar */}
      <section className="ps-hero-section"
        style={{ background: 'var(--teal-700)', color: 'var(--text-inverse)',
                 padding: 'var(--space-9) var(--space-5) var(--space-10)', overflow: 'hidden' }}>
        <div className="ps-hero-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div>
            <div style={{ color: 'var(--sun-400)', fontFamily: 'var(--font-display)', fontWeight: 600,
                          letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, marginBottom: 'var(--space-4)' }}>
              Villa María, Córdoba
            </div>
            <h1 className="ps-hero-title"
              style={{ color: 'var(--text-inverse)', fontSize: 'clamp(32px, 7.5vw, 50px)', lineHeight: 1.1,
                       letterSpacing: '-0.02em', marginBottom: 'var(--space-5)',
                       fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Piscinas con más de 30 años de trayectoria
            </h1>
            <p className="ps-hero-subtitle"
              style={{ fontSize: 'clamp(15px, 4vw, 18px)', lineHeight: 1.65,
                       color: 'var(--text-inverse-muted)', maxWidth: 480, marginBottom: 'var(--space-6)' }}>
              Construimos piscinas de hormigón y de fibra INDUSPLAST. También trabajamos con revestimientos,
              cercos, cobertores y climatización, y ofrecemos accesorios en nuestra tienda.
            </p>
            <div className="ps-hero-btns" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" to="/presupuesto">Pedir presupuesto</Button>
              <WhatsAppButton inverse size="lg" text={WHATSAPP_GREETING} location="hero">Consultar por WhatsApp</WhatsAppButton>
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
                // Miniatura borrosa de la foto del hero: se ve desde el primer pintado (antes de que
                // responda /api/projects) y sigue debajo de la foto nítida hasta que esta termina de
                // cargar, para que la aparición sea un fundido y no un salto.
                placeholderDataUrl={!heroProject || heroProject.imageUrl ? HERO_BLUR_PLACEHOLDER : undefined}
                priority
                sizes="(max-width: 767px) calc(100vw - 40px), 540px"
                srcSetWidths={[400, 560, 800, 1080]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — confianza y trayectoria, sin protagonismo del amarillo */}
      <StatsStrip />

      {/* LÍNEAS DE TRABAJO */}
      <section ref={servicesReveal.ref} className={servicesReveal.className} style={{ padding: 'var(--space-9) var(--space-5)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionHeading eyebrow="Servicios" title="Construcción, renovación y equipamiento" align="left"
            action={<Button variant="outline" to="/servicios">Ver todos los servicios</Button>} />
          <div className="ps-services-grid" style={{ '--ps-cols': serviceColumns(services.length) }}>
            {services.map((s) => (
              <Link key={s._id || s.title} to="/servicios" className="ps-card-link">
                <Card accent={s.tone} interactive padding="lg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {s.tag && (
                    <Badge tone={s.tone} variant={s.variant || 'soft'} size="sm" style={{ marginBottom: 'var(--space-3)', alignSelf: 'flex-start' }}>
                      {s.tag}
                    </Badge>
                  )}
                  <h3 style={{ fontSize: 18, marginBottom: 'var(--space-2)', fontWeight: 700, fontFamily: 'var(--font-display)',
                               color: 'var(--text-strong)' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{s.description}</p>
                  {s.bullets?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {s.bullets.slice(0, 3).map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.4 }}>
                          <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-primary)', marginTop: 7, flexShrink: 0 }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', color: 'var(--text-link)', fontWeight: 700, fontSize: 14 }}>
                    {s.cta || 'Saber más'} <span aria-hidden="true">→</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROYECTOS — el principal argumento de venta, con foto protagonista. Sin proyectos destacados la
          sección no se muestra: un hueco con texto para el admin no le dice nada al visitante. */}
      {(projectsLoading || featuredProjects.length > 0) && (
        <section ref={projectsReveal.ref} className={projectsReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <SectionHeading eyebrow="Proyectos" title="Algunas de nuestras obras" align="left"
              action={<Button variant="outline" to="/proyectos">Ver todos los proyectos</Button>} />

            {projectsLoading ? (
              <div className="ps-projects-grid">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    borderRadius: 'var(--radius-lg)', background: 'var(--grey-200)',
                    ...(i === 0 ? { gridRow: '1 / span 2' } : {}),
                  }} />
                ))}
              </div>
            ) : (
              <div className="ps-projects-grid">
                {featuredProjects.map((p, i) => (
                  <Link key={p._id} to="/proyectos" aria-label={`${p.title}, ${p.location}. Ver proyectos`}
                    style={{
                      position: 'relative', display: 'block', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      ...(i === 0 ? { gridRow: '1 / span 2' } : {}),
                    }}>
                    <Photo label={`${p.title} · ${p.location}`} height="100%" src={p.imageUrl || undefined} zoom
                      sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 50vw, 560px" srcSetWidths={[400, 560, 800, 1120]} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TIENDA */}
      {featured.length > 0 && (
        <section ref={productsReveal.ref} className={productsReveal.className} style={{ padding: '0 var(--space-5) var(--space-9)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <SectionHeading eyebrow="Tienda" title="Accesorios y productos para tu piscina" align="left"
              action={<Button variant="outline" to="/tienda">Ver la tienda</Button>} />
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
