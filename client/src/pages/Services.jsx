import { useEffect, useState } from 'react';
import { Button } from '../design-system/Button';
import { Badge } from '../design-system/Badge';
import { Photo } from '../design-system/Photo';
import { servicesAPI } from '../services/api';
import { takePrefetched } from '../utils/routePrefetch';
import { SERVICE_PHOTO } from '../utils/imageSpecs';
import CtaBlock from '../components/sections/CtaBlock';
import PageHeader from '../components/sections/PageHeader';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import { FALLBACK_SERVICES } from '../data/fallbackServices';

export default function Services() {
  const [rows, setRows] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si la sección se precalentó (ver utils/routePrefetch.js) los datos ya están; si no, se piden como siempre.
    takePrefetched('services', () => servicesAPI.getAll())
      .then(({ data }) => { if (data?.length > 0) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <PageHeader
          eyebrow="Servicios"
          title="De la primera idea al último baño"
          lead="Construimos piscinas de hormigón y de fibra INDUPLAST, y nos ocupamos de revestimientos, cercos, cobertores y climatización."
          style={{ marginBottom: 52 }}
        />

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
                  {/* Las dos primeras filas entran en pantalla sin scrollear: sin diferir su carga. */}
                  <Photo label={r.title} height={280} src={r.imageUrl || undefined} priority={i < 2}
                    sizes={SERVICE_PHOTO.sizes} srcSetWidths={SERVICE_PHOTO.widths} />
                </div>
                <div style={{ direction: 'ltr' }}>
                  <Badge tone={r.tone} variant={r.variant} style={{ marginBottom: 14 }}>{r.tag}</Badge>
                  <h2 style={{ fontSize: 'clamp(20px, 5.5vw, 28px)', marginBottom: 12,
                               fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>{r.title}</h2>
                  <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 18 }}>
                    {r.descriptionLong || r.description}
                  </p>
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
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {/* El servicio viaja en la URL: el formulario de presupuesto lo deja ya elegido. */}
                    <Button variant="primary" to={`/presupuesto?servicio=${encodeURIComponent(r.title)}`}
                      aria-label={`${r.cta || 'Pedir presupuesto'}: ${r.title}`}>
                      {r.cta || 'Pedir presupuesto'}
                    </Button>
                    <WhatsAppButton text={`Hola! Quiero consultar por: ${r.title}.`} location="servicios"
                      aria-label={`Consultar por WhatsApp: ${r.title}`}>
                      Consultar por WhatsApp
                    </WhatsAppButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accesorios: no son un servicio sino productos, y viven en la tienda. */}
      {!loading && (
        <div style={{ maxWidth: 1120, margin: '52px auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)',
                        padding: 'var(--space-6)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)' }}>
            <div>
              <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 'var(--space-1)' }}>
                Accesorios para tu piscina
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.6 }}>
                Mirá los productos disponibles y armá tu pedido para finalizarlo por WhatsApp.
              </p>
            </div>
            <Button variant="outline" to="/tienda">Ver la tienda</Button>
          </div>
        </div>
      )}

      {/* Cierre consistente con el resto del sitio: todas las páginas informativas
          terminan ofreciendo el mismo próximo paso. */}
      <div style={{ marginTop: 64 }}>
        <CtaBlock
          title="¿Cuál de estos necesitás?"
          text="Contanos qué tenés en mente y te armamos un presupuesto sin compromiso."
          primaryLabel="Pedir presupuesto"
          secondaryLabel="Ver proyectos"
          secondaryTo="/proyectos"
        />
      </div>
    </section>
  );
}
