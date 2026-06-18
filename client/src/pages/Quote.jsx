import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Checkbox } from '../design-system/Checkbox';
import { Switch } from '../design-system/Switch';
import { Photo } from '../design-system/Photo';

const tipos = [
  { id: 'obra',   label: 'Piscina nueva' },
  { id: 'reforma', label: 'Reforma' },
  { id: 'cerco',  label: 'Cerco / Seguridad' },
];

export default function Quote() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [tipo, setTipo] = useState('obra');

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div className="ps-quote-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Left */}
        <div>
          <div className="ps-eyebrow" style={{ marginBottom: 12 }}>Presupuesto sin compromiso</div>
          <h1 style={{ fontSize: 'clamp(22px, 5.5vw, 38px)', lineHeight: 1.1, letterSpacing: '-0.02em',
                       marginBottom: 16, fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>
            Cuéntanos tu proyecto
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 24 }}>
            Rellena el formulario y te visitamos en 48 horas. Sin coste y sin compromiso.
          </p>
          <div className="ps-quote-photo" style={{ marginBottom: 24 }}>
            <Photo label="Visita técnica" height={200} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="teal" dot>Respuesta en 48h</Badge>
            <Badge tone="sun" variant="solid">Garantía 10 años</Badge>
          </div>
        </div>

        {/* Right — form */}
        <Card padding="lg">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <svg width="56" height="56" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 14 }}>
                <circle cx="32" cy="20" r="11" fill="var(--sun-500)" />
                <path d="M6 38 Q14 32 22 38 Q30 44 38 38 Q46 32 58 38" stroke="var(--teal-600)"
                  strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M6 50 Q14 44 22 50 Q30 56 38 50 Q46 44 58 50" stroke="var(--teal-600)"
                  strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
              <h2 style={{ fontSize: 24, marginBottom: 10, fontFamily: 'var(--font-display)',
                           color: 'var(--text-strong)' }}>¡Gracias!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                Hemos recibido tu solicitud. Te llamamos en menos de 48 horas.
              </p>
              <Button variant="secondary" onClick={() => { setSent(false); navigate('/'); }}>
                Volver al inicio
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                                color: 'var(--text-strong)', display: 'block', marginBottom: 8 }}>
                  Tipo de proyecto
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tipos.map(t => (
                    <button type="button" key={t.id} onClick={() => setTipo(t.id)} style={{
                      flex: '0 0 auto', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                      border: tipo === t.id ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
                      background: tipo === t.id ? 'var(--teal-50)' : '#fff',
                      color: tipo === t.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                      transition: 'all var(--duration-fast) var(--ease-out)',
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>

              <div className="ps-form-row">
                <Input label="Nombre" placeholder="Tu nombre" required />
                <Input label="Teléfono" placeholder="600 123 456" required />
              </div>
              <Input label="Email" placeholder="hola@ejemplo.com" type="email" required />
              <Input label="Localidad" placeholder="Corrientes 1210, Villa María…" />
              <Switch label="Quiero también plan de mantenimiento" />
              <Checkbox label="Acepto la política de privacidad" defaultChecked />
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Solicitar presupuesto
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}
