import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { productsAPI, projectsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Photo } from '../design-system/Photo';

const services = [
  { t: 'Piscinas de obra',   d: 'Diseño y construcción a medida, de hormigón gunitado.',             a: 'sun' },
  { t: 'Reformas',           d: 'Renovamos vaso, coronación y depuración.',                           a: 'teal' },
  { t: 'Climatización',      d: 'Bombas de calor y cubiertas para nadar más meses.',                  a: 'sun' },
  { t: 'Cercos y seguridad', d: 'Cercos removibles y fijos para proteger a niños y mascotas.',        a: 'teal' },
];

const stats = [
  { n: '+850', l: 'piscinas construidas' },
  { n: '20',   l: 'años en Villa María' },
  { n: '4.9★', l: 'valoración media' },
  { n: '48h',  l: 'para tu presupuesto' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [featured, setFeatured] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);

  const inCartByProductId = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [items]);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 4 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {});
    projectsAPI.getAll({ featured: true })
      .then(({ data }) => setFeaturedProjects(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <section className="ps-hero-section"
        style={{ background: 'var(--teal-700)', color: '#fff',
                 padding: '72px 20px 80px', overflow: 'hidden' }}>
        <div className="ps-hero-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div>
            <div style={{ color: 'var(--sun-400)', fontFamily: 'var(--font-display)', fontWeight: 600,
                          letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, marginBottom: 16 }}>
              Piscinas en Villa María, Córdoba
            </div>
            <h1 className="ps-hero-title"
              style={{ color: '#fff', fontSize: 'clamp(32px, 8vw, 52px)', lineHeight: 1.06,
                       letterSpacing: '-0.02em', marginBottom: 18,
                       fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Tu piscina,<br />disfrutada<br />todo el año
            </h1>
            <p className="ps-hero-subtitle"
              style={{ fontSize: 'clamp(14px, 4vw, 18px)', lineHeight: 1.6,
                       color: 'rgba(255,255,255,0.82)', maxWidth: 440, marginBottom: 28 }}>
              Diseñamos, construimos y mantenemos piscinas a medida. Del primer plano al primer baño, sin complicaciones.
            </p>
            <div className="ps-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/presupuesto')}>Pide presupuesto</Button>
              <Button variant="ghost" size="lg"
                style={{ color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}
                onClick={() => navigate('/proyectos')}>Ver proyectos</Button>
            </div>
          </div>
          <div className="ps-hero-photo">
            <Photo
              label={featuredProjects[0] ? `${featuredProjects[0].title} · ${featuredProjects[0].location}` : 'Piscina infinity · Villa María'}
              height={360}
              src={featuredProjects[0]?.imageUrl || undefined}
            />
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section style={{ background: 'var(--sun-500)', padding: '22px 20px' }}>
        <div className="ps-stats-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30,
                            color: 'var(--teal-900)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-800)', marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '72px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Qué hacemos</div>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)',
                         color: 'var(--text-strong)' }}>Todo lo que tu piscina necesita</h2>
          </div>
          <div className="ps-services-grid">
            {services.map(s => (
              <Card key={s.t} accent={s.a} interactive padding="lg" onClick={() => navigate('/servicios')}>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'var(--font-display)',
                             color: 'var(--text-strong)' }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.d}</p>
                <div style={{ marginTop: 16, color: 'var(--text-link)', fontWeight: 700, fontSize: 14 }}>
                  Saber más →
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section style={{ padding: '0 20px 72px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="ps-eyebrow" style={{ marginBottom: 8 }}>Proyectos recientes</div>
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
                <div key={p._id} style={{ position: 'relative', ...(i === 0 ? { gridRow: '1 / span 2' } : {}) }}>
                  <Photo label={`${p.title} · ${p.location}`} height="100%" src={p.imageUrl || undefined} />
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    background: p.status === 'En construcción' ? 'var(--sun-100)' : 'var(--green-100)',
                    color: p.status === 'En construcción' ? 'var(--sun-800)' : 'var(--green-500)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {p.status || 'Terminada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section style={{ padding: '0 20px 72px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                          marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ps-eyebrow" style={{ marginBottom: 8 }}>Top picks</div>
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
      <section style={{ padding: '0 20px 72px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="ps-cta-block"
            style={{ background: 'var(--teal-800)', borderRadius: 'var(--radius-2xl)', padding: '52px 48px' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: 32, marginBottom: 10,
                           fontFamily: 'var(--font-display)', fontWeight: 600 }}>¿Listo para tu piscina?</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 460 }}>
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
