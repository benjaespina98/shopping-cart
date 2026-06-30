import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Checkbox } from '../design-system/Checkbox';
import { Photo } from '../design-system/Photo';
import { servicesAPI, quotesAPI } from '../services/api';

const FALLBACK_TYPES = ['Piscina nueva', 'Reforma', 'Cerco / Seguridad'];
const OTHER_TYPE = 'Otra consulta';

export default function Quote() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [types, setTypes] = useState(FALLBACK_TYPES);
  const [tipo, setTipo] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '' });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);

  useEffect(() => {
    servicesAPI.getAll()
      .then(({ data }) => {
        if (data?.length > 0) {
          const fromServices = data.map((s) => s.title);
          setTypes(fromServices);
          setTipo(fromServices[0]);
        } else {
          setTipo(FALLBACK_TYPES[0]);
        }
      })
      .catch(() => setTipo(FALLBACK_TYPES[0]));
  }, []);

  const allTypes = [...types, OTHER_TYPE];

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipo || !form.name || !form.phone || !form.email) {
      setError('Completá tipo de proyecto, nombre, teléfono y email.');
      return;
    }
    if (!acceptedPrivacy) {
      setError('Tenés que aceptar la política de privacidad.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await quotesAPI.create({
        projectType: tipo,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos enviar tu solicitud. Probá de nuevo.');
    } finally {
      setSending(false);
    }
  };

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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                                color: 'var(--text-strong)', display: 'block', marginBottom: 8 }}>
                  Tipo de proyecto
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {allTypes.map(t => (
                    <button type="button" key={t} onClick={() => setTipo(t)} style={{
                      flex: '0 0 auto', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                      border: tipo === t ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
                      background: tipo === t ? 'var(--teal-50)' : 'var(--surface-card)',
                      color: tipo === t ? 'var(--brand-primary)' : 'var(--text-muted)',
                      transition: 'all var(--duration-fast) var(--ease-out)',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="ps-form-row">
                <Input label="Nombre" placeholder="Tu nombre" required value={form.name} onChange={setField('name')} />
                <Input label="Teléfono" placeholder="600 123 456" required value={form.phone} onChange={setField('phone')} />
              </div>
              <Input label="Email" placeholder="hola@ejemplo.com" type="email" required value={form.email} onChange={setField('email')} />
              <Input label="Localidad" placeholder="Corrientes 1210, Villa María…" value={form.location} onChange={setField('location')} />
              <Checkbox label="Acepto la política de privacidad" checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)} />
              {error && (
                <p style={{ color: 'var(--red-500)', fontSize: 14, fontFamily: 'var(--font-body)' }}>{error}</p>
              )}
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={sending}>
                {sending ? 'Enviando...' : 'Solicitar presupuesto'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}
